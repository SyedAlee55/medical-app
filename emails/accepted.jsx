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

export const AppointmentAcceptedEmail = ({ doctorName, date, specialty }) => (
  <Html>
    <Head />
    <Preview>Appointment Confirmed - Tj's Medical Hub</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Visit Confirmed</Heading>
        <Text style={text}>
          Great news! Your appointment with <strong>Dr. {doctorName}</strong> in <strong>{specialty}</strong> has been confirmed.
        </Text>
        <Section style={detailsSection}>
          <Text style={detailsText}><strong>Scheduled for:</strong> {date}</Text>
          <Text style={detailsText}><strong>Location:</strong> Main Clinic</Text>
        </Section>
        <Section style={buttonSection}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_SITE_URL}/patient/dashboard`}
          >
            Go to Dashboard
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Tj's Medical Hub - Caring for you, simplified.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AppointmentAcceptedEmail;

const main = {
  backgroundColor: "#f0fdf4",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "10px",
  border: "1px solid #dcfce7",
};

const h1 = {
  color: "#166534",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center",
  margin: "30px 0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  padding: "0 40px",
};

const detailsSection = {
  padding: "0 40px",
  marginTop: "20px",
};

const detailsText = {
  color: "#374151",
  fontSize: "14px",
  margin: "5px 0",
};

const buttonSection = {
  textAlign: "center",
  marginTop: "30px",
};

const button = {
  backgroundColor: "#16a34a",
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
  borderColor: "#dcfce7",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center",
};
