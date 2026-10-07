import nodemailer from 'nodemailer';

async function testTransport() {
  console.log('Testing SMTP transport verify with invalid host...');
  const transporter = nodemailer.createTransport({
    host: 'invalid.nonexistent.domain-999.xyz',
    port: 587,
    secure: false,
    connectionTimeout: 3000,
  });

  try {
    await transporter.verify();
    console.log('UNEXPECTED: verify succeeded');
  } catch (err: any) {
    console.log('Expected error caught:', err.code, err.message);
  }
}

testTransport().catch(console.error);
