// https://stackoverflow.com/questions/8595509/how-do-you-share-constants-in-nodejs-modules

const HEARTBEAT_XSD = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="Heartbeat">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="Timestamp" type="xs:dateTime"/>
                <xs:element name="Status" type="xs:string"/>
                <xs:element name="SystemName" type="xs:string"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`;

const LOG_XSD = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="LogEntry">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="SystemName" type="xs:string"/>
                <xs:element name="FunctionName" type="xs:string"/>
                <xs:element name="Logs" type="xs:string"/>
                <xs:element name="Error" type="xs:boolean"/>
                <xs:element name="Timestamp" type="xs:dateTime"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`

const USER_XSD = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="user">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="routing_key">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="crud_operation">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:enumeration value="create"/>
                            <xs:enumeration value="update"/>
                            <xs:enumeration value="delete"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="id">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="first_name" type="xs:string" nillable="true"/>
                <xs:element name="last_name" type="xs:string" nillable="true"/>
                <xs:element name="email" type="xs:string" nillable="true"/>
                <xs:element name="telephone" type="xs:string" nillable="true"/>
                <xs:element name="birthday">
                    <xs:simpleType>
                        <xs:union>
                            <xs:simpleType>
                                <xs:restriction base='xs:string'>
                                    <xs:length value="0"/>
                                </xs:restriction>
                            </xs:simpleType>
                            <xs:simpleType>
                                <xs:restriction base='xs:date' />
                            </xs:simpleType>
                        </xs:union>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="address">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="country" type="xs:string" nillable="true"/>
                            <xs:element name="state" type="xs:string" nillable="true"/>
                            <xs:element name="city" type="xs:string" nillable="true"/>
                            <xs:element name="zip">
                                <xs:simpleType>
                                    <xs:union>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:string'>
                                                <xs:length value="0"/>
                                            </xs:restriction>
                                        </xs:simpleType>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:integer' />
                                        </xs:simpleType>
                                    </xs:union>
                                </xs:simpleType>
                            </xs:element>
                            <xs:element name="street" type="xs:string" nillable="true"/>
                            <xs:element name="house_number">
                                <xs:simpleType>
                                    <xs:union>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:string'>
                                                <xs:length value="0"/>
                                            </xs:restriction>
                                        </xs:simpleType>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:integer' />
                                        </xs:simpleType>
                                    </xs:union>
                                </xs:simpleType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="company_email" type="xs:string" nillable="true"/>
                <xs:element name="company_id" type="xs:string" nillable="true"/>
                <xs:element name="source" type="xs:string"  nillable="true"/>
                <xs:element name="user_role">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:enumeration value="speaker"/>
                            <xs:enumeration value="individual"/>
                            <xs:enumeration value="employee"/>
                            <xs:enumeration value=""/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="invoice" type="xs:string" nillable="true"/>
                <xs:element name="calendar_link" type="xs:string" nillable="true"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`;

const COMPANY_XSD = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="company">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="routing_key">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="crud_operation">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:enumeration value="create"/>
                            <xs:enumeration value="update"/>
                            <xs:enumeration value="delete"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="id">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="name" type="xs:string" nillable="true"/>
                <xs:element name="email" type="xs:string" nillable="true"/>
                <xs:element name="telephone" type="xs:string" nillable="true"/>
                <xs:element name="logo" type="xs:string" nillable="true"/>
                <xs:element name="address">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="country" type="xs:string" nillable="true"/>
                            <xs:element name="state" type="xs:string" nillable="true"/>
                            <xs:element name="city" type="xs:string" nillable="true"/>
                            <xs:element name="zip">
                                <xs:simpleType>
                                    <xs:union>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:string'>
                                                <xs:length value="0"/>
                                            </xs:restriction>
                                        </xs:simpleType>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:integer' />
                                        </xs:simpleType>
                                    </xs:union>
                                </xs:simpleType>
                            </xs:element>
                            <xs:element name="street" type="xs:string" nillable="true"/>
                            <xs:element name="house_number">
                                <xs:simpleType>
                                    <xs:union>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:string'>
                                                <xs:length value="0"/>
                                            </xs:restriction>
                                        </xs:simpleType>
                                        <xs:simpleType>
                                            <xs:restriction base='xs:integer' />
                                        </xs:simpleType>
                                    </xs:union>
                                </xs:simpleType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="type">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:enumeration value="customer"/>
                            <xs:enumeration value="sponsor"/>
                            <xs:enumeration value="speaker"/>
                            <xs:enumeration value=""/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="invoice" type="xs:string" nillable="true"/>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`;

const ORDER_XSD = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="order">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="routing_key">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="crud_operation">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:enumeration value="create"/>
                            <xs:enumeration value="update"/>
                            <xs:enumeration value="delete"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="id">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="user_id" type="xs:string" nillable="true"/>
                <xs:element name="company_id" type="xs:string" nillable="true"/>
                <xs:element name="products">
                    <xs:complexType>
                        <xs:sequence>
                            <xs:element name="product" maxOccurs="unbounded">
                                <xs:complexType>
                                    <xs:sequence>
                                        <xs:element name="product_id" type="xs:string" nillable="true"/>
                                        <xs:element name="name" type="xs:string" nillable="true"/>
                                        <xs:element name="amount">
                                            <xs:simpleType>
                                                <xs:union>
                                                    <xs:simpleType>
                                                        <xs:restriction base='xs:string'>
                                                            <xs:length value="0"/>
                                                        </xs:restriction>
                                                    </xs:simpleType>
                                                    <xs:simpleType>
                                                        <xs:restriction base='xs:integer' />
                                                    </xs:simpleType>
                                                </xs:union>
                                            </xs:simpleType>
                                        </xs:element>
                                    </xs:sequence>
                                </xs:complexType>
                            </xs:element>
                        </xs:sequence>
                    </xs:complexType>
                </xs:element>
                <xs:element name="total_price">
                    <xs:simpleType>
                        <xs:union>
                            <xs:simpleType>
                                <xs:restriction base='xs:string'>
                                    <xs:length value="0"/>
                                </xs:restriction>
                            </xs:simpleType>
                            <xs:simpleType>
                                <xs:restriction base='xs:decimal' />
                            </xs:simpleType>
                        </xs:union>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="status" nillable="true">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:enumeration value="paid"/>
                            <xs:enumeration value="factuur"/>
                            <xs:enumeration value=""/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`;

const PRODUCT_XSD = `
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
    <xs:element name="product">
        <xs:complexType>
            <xs:sequence>
                <xs:element name="routing_key">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="crud_operation">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:enumeration value="create"/>
                            <xs:enumeration value="update"/>
                            <xs:enumeration value="delete"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="id">
                    <xs:simpleType>
                        <xs:restriction base="xs:string">
                            <xs:minLength value="1"/>
                        </xs:restriction>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="name" type="xs:string" nillable="true"/>
                <xs:element name="price">
                    <xs:simpleType>
                        <xs:union>
                            <xs:simpleType>
                                <xs:restriction base="xs:string">
                                    <xs:length value="0"/>
                                </xs:restriction>
                            </xs:simpleType>
                            <xs:simpleType>
                                <xs:restriction base="xs:decimal"/>
                            </xs:simpleType>
                        </xs:union>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="amount">
                    <xs:simpleType>
                        <xs:union>
                            <xs:simpleType>
                                <xs:restriction base="xs:string">
                                    <xs:length value="0"/>
                                </xs:restriction>
                            </xs:simpleType>
                            <xs:simpleType>
                                <xs:restriction base="xs:integer"/>
                            </xs:simpleType>
                        </xs:union>
                    </xs:simpleType>
                </xs:element>
                <xs:element name="category" type="xs:string" nillable="true"/>
                <xs:element name="btw">
                    <xs:simpleType>
                        <xs:union>
                            <xs:simpleType>
                                <xs:restriction base="xs:string">
                                    <xs:length value="0"/>
                                </xs:restriction>
                            </xs:simpleType>
                            <xs:simpleType>
                                <xs:restriction base="xs:decimal"/>
                            </xs:simpleType>
                        </xs:union>
                    </xs:simpleType>
                </xs:element>
            </xs:sequence>
        </xs:complexType>
    </xs:element>
</xs:schema>
`;

module.exports = Object.freeze({
    SYSTEM: "facturatie",
    MAIN_EXCHANGE: "amq.topic",
    INVOICE_ROUTING: "invoice.facturatie",
    USER_ROUTING: "user.facturatie",
    PRODUCT_ROUTING: "product.facturatie",
    WEBHOOK_PORT: 877,
    HEARTBEAT_XSD,
    LOG_XSD,
    USER_XSD,
    COMPANY_XSD,
    ORDER_XSD,
    PRODUCT_XSD
});
