import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function createSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const pages = [
    { text: 'Slide 1: Gesture Controls', color: rgb(0.1, 0.1, 0.1) },
    { text: 'Slide 2: Hand Tracking Tech', color: rgb(0.1, 0.1, 0.1) },
    { text: 'Slide 3: Final Year Project', color: rgb(0.1, 0.1, 0.1) },
  ];

  for (const p of pages) {
    const page = pdfDoc.addPage([600, 400]);
    page.drawText(p.text, {
      x: 50,
      y: 200,
      size: 30,
      font,
      color: p.color,
    });
    // Removed emojis as standard fonts don't support them without embedding
    page.drawText('Use Open Palm for Next, Fist for Prev', {
      x: 50,
      y: 150,
      size: 15,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const filePath = path.join(process.cwd(), 'client', 'public', 'sample.pdf');
  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, pdfBytes);
  console.log('Sample PDF created at:', filePath);
}

createSamplePdf().catch(console.error);
