from lxml import etree
import pika
import time
# Define your XML and XSD as strings
heartbeat_xml = """
<Heartbeat>
    <Timestamp>2024-03-28T12:30:00Z</Timestamp>
    <Status>1</Status>
    <SystemName>Facturatie</SystemName>
</Heartbeat>
"""
heartbeat_xsd = """
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
"""
# Parse the documents
xml_doc = etree.fromstring(heartbeat_xml.encode())
xsd_doc = etree.fromstring(heartbeat_xsd.encode())
# Create a schema object
schema = etree.XMLSchema(xsd_doc)
# Validate
if schema.validate(xml_doc):
    print('XML is valid')
else:
    print('XML is not valid')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
channel = connection.channel()
channel.queue_declare(queue='heartbeat_queue')
# Loop to send heartbeat message every two seconds
try:
    while True:
        channel.basic_publish(exchange='', routing_key='heartbeat_queue', body=heartbeat_xml)
        print('Message sent')
        time.sleep(2)  # Wait for 2 seconds
except KeyboardInterrupt:
    # Graceful shutdown on Ctrl+C
    print("Stopping...")
finally:
    connection.close()