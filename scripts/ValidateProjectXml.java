// CI-only offline validator. Uses the JDK standard library; no runtime application dependency.
import java.nio.file.Files;
import java.nio.file.Path;
import javax.xml.XMLConstants;
import javax.xml.parsers.SAXParserFactory;
import javax.xml.transform.sax.SAXSource;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.SchemaFactory;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
public class ValidateProjectXml {
 public static void main(String[] args) throws Exception {
  if(args.length<2)throw new IllegalArgumentException("schema and XML paths required");
  SchemaFactory factory=SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
  factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING,true);
  factory.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD,"");factory.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA,"");
  var schema=factory.newSchema(new StreamSource(Path.of(args[0]).toFile()));
  for(int i=1;i<args.length;i++){
   Path input=Path.of(args[i]);if(Files.size(input)>8*1024*1024)throw new IllegalArgumentException("XML exceeds 8 MiB");
   SAXParserFactory parsers=SAXParserFactory.newInstance();parsers.setNamespaceAware(true);
   parsers.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING,true);
   parsers.setFeature("http://apache.org/xml/features/disallow-doctype-decl",true);
   parsers.setFeature("http://xml.org/sax/features/external-general-entities",false);
   parsers.setFeature("http://xml.org/sax/features/external-parameter-entities",false);
   XMLReader reader=parsers.newSAXParser().getXMLReader();reader.setEntityResolver((publicId,systemId)->{throw new org.xml.sax.SAXException("external entity forbidden");});
   var validator=schema.newValidator();validator.setProperty(XMLConstants.ACCESS_EXTERNAL_DTD,"");validator.setProperty(XMLConstants.ACCESS_EXTERNAL_SCHEMA,"");
   try(var stream=Files.newInputStream(input)){validator.validate(new SAXSource(reader,new InputSource(stream)));}
  }
  System.out.println("GI MSPDI subset profile valid; external application compatibility not homologated.");
 }
}
