import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

export const NewRequestEmail = ({ patientName, specialty, date }) => (
  <Html>
    <Head />
    <Preview>New Appointment Request - Tj's Medical Hub</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Request Received</Heading>
        <Text style={text}>
          Hello, you have a new appointment request for your specialty: <strong>{specialty}</strong>.
        </Text>
        <Section style={detailsSection}>
          <Text style={detailsText}><strong>Patient:</strong> {patientName}</Text>
          <Text style={detailsText}><strong>Date:</strong> {date}</Text>
        </Section>
        <Section style={buttonSection}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_SITE_URL}/employee/dashboard`}
          >
            View Request
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Tj's Medical Hub - Secure Healthcare Management
        </Text>
      </Container>
    </Body>
  </Html>
);

export default NewRequestEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "10px",
  border: "1px solid #e6ebf1",
};

const h1 = {
  color: "#1e293b",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
  margin: "30px 0",
};

const text = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const detailsSection = {
  padding: "0 40px",
  marginTop: "20px",
};

const detailsText = {
  color: "#475569",
  fontSize: "14px",
  margin: "5px 0",
};

const buttonSection = {
  textAlign: "center",
  marginTop: "30px",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center",
};
