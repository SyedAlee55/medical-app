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

export const AppointmentRejectedEmail = ({ doctorName, specialty }) => (
  <Html>
    <Head />
    <Preview>Update regarding your request - Tj's Medical Hub</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Appointment Update</Heading>
        <Text style={text}>
          Thank you for your interest in <strong>Dr. {doctorName}'s</strong> schedule for <strong>{specialty}</strong>. 
          Unfortunately, we are unable to confirm your specific request at this time.
        </Text>
        <Section style={detailsSection}>
          <Text style={detailsText}>
            This could be due to high demand or a sudden schedule change. 
            We recommend checking other available specialists or choosing a different time slot.
          </Text>
        </Section>
        <Section style={buttonSection}>
          <Button
            style={button}
            href={`${process.env.NEXT_PUBLIC_SITE_URL}/patient/dashboard/book`}
          >
            Reschedule Now
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Tj's Medical Hub - Caring for you, always.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default AppointmentRejectedEmail;

const main = {
  backgroundColor: "#fef2f2",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "10px",
  border: "1px solid #fee2e2",
};

const h1 = {
  color: "#991b1b",
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
  backgroundColor: "#b91c1c",
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
  borderColor: "#fee2e2",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center",
};
