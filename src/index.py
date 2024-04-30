from lxml import etree
import pika
import time
from datetime import datetime
import logging
import docker

TEAM = 'facturatie'

def is_container_running(container_name):
 client = docker.from_env()
 try:
  container = client.containers.get(container_name)
  return container.status == 'running'
 except docker.errors.NotFound:
  return False

def main(timestamp):
 global TEAM
 logger = logging.getLogger(__name__)

 handler = logging.FileHandler('heartbeat.log')
 handler.setLevel(logging.INFO)
 formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
 handler.setFormatter(formatter)
 logger.addHandler(handler)

 heartbeat_xml = f'''
 <Heartbeat>
  <Timestamp>{timestamp.isoformat()}</Timestamp>
  <Status>{"Active" if is_container_running("yourservicecontainer") else "Inactive"}</Status>
  <SystemName>{TEAM}</SystemName>
 </Heartbeat>
 '''

 heartbeat_xsd = f'''
 <xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="Heartbeat">
   <xs:complexType>
    <xs:sequence>
     <xs:element name="Timestamp" type="xs:dateTime" />
     <xs:element name="Status" type="xs:int" />
     <xs:element name="SystemName" type="xs:string" />
    </xs:sequence>
   </xs:complexType>
  </xs:element>
 </xs:schema>
 '''

 xml_doc = etree.fromstring(heartbeat_xml.encode())
 xsd_doc = etree.fromstring(heartbeat_xsd.encode())

 schema = etree.XMLSchema(xsd_doc)

 if schema.validate(xml_doc):
  logger.info('XML is valid')
 else:
  logger.error('XML is not valid')

 credentials = pika.PlainCredentials('user', 'password')
 connection = pika.BlockingConnection(pika.ConnectionParameters(host='10.2.160.51', credentials=credentials))
 channel = connection.channel()

 channel.queue_declare(queue='heartbeat_queue', durable=True)
 channel.basic_publish(exchange='', routing_key='heartbeat_queue', body=heartbeat_xml)


if __name__ == '__main__':
 try:
  while True:
   main(datetime.now())
   time.sleep(1)
 except KeyboardInterrupt:
  print('Interrupted')

