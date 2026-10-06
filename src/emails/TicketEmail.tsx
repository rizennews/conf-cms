import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface TicketEmailProps {
  fullName: string;
  eventName: string;
  registrationId: string | number;
}

export const TicketEmail = ({
  fullName = 'Attendee',
  eventName = 'Multiply Sunday 2026',
  registrationId = '12345',
}: TicketEmailProps) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${registrationId}`;

  return (
    <Html>
      <Head />
      <Preview>Your Ticket for {eventName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You&apos;re Registered!</Heading>
          
          <Text style={text}>
            Hi {fullName},
          </Text>
          <Text style={text}>
            Thank you for registering for <strong>{eventName}</strong>. We are incredibly excited to see you there!
          </Text>
          
          <Section style={qrSection}>
            <Text style={qrLabel}>Your Unique Check-in Code:</Text>
            <Img
              src={qrUrl}
              width="250"
              height="250"
              alt={`QR Code for ${registrationId}`}
              style={qrImage}
            />
            <Text style={ticketId}>Ticket ID: {registrationId}</Text>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Please have this QR code ready on your phone when you arrive. You can screenshot this email for easy access.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TicketEmail;

// --- Styles ---
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  maxWidth: '600px',
};

const h1 = {
  color: '#111',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 20px',
  padding: '0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
};

const qrSection = {
  marginTop: '30px',
  marginBottom: '30px',
  padding: '30px 20px',
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  border: '1px solid #e5e7eb',
  textAlign: 'center' as const,
};

const qrLabel = {
  color: '#4b5563',
  fontSize: '14px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 15px',
  fontWeight: 'bold',
};

const qrImage = {
  margin: '0 auto',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  padding: '10px',
  backgroundColor: '#fff',
};

const ticketId = {
  color: '#6b7280',
  fontSize: '14px',
  marginTop: '15px',
  fontFamily: 'monospace',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
};
