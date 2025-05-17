import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../../supabase/server';
import JSZip from 'jszip';
import fs from 'fs/promises';
import path from 'path';
import { customAlphabet } from 'nanoid';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Hardcoded admin credentials
const ADMIN_EMAIL = "admin@emeahss.edu";
const nanoid = customAlphabet('1234567890abcdef', 10);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.email !== ADMIN_EMAIL) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get all applications
    const { data: applications, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching applications:", error);
      return new NextResponse(JSON.stringify({ error: 'Failed to fetch applications' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create a new zip archive
    const zip = new JSZip();
    
    // Create PDFs for each application
    for (const application of applications) {
      try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
        
        // Get the standard font
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Set up some constants for positioning
        const margin = 50;
        const width = page.getWidth() - (margin * 2);
        const smallLineHeight = 16;
        const lineHeight = 20;
        const headerHeight = 24;
        let y = page.getHeight() - margin;
        
        // Colors
        const lightGrey = rgb(0.95, 0.95, 0.95);
        const black = rgb(0, 0, 0);
        const darkGrey = rgb(0.5, 0.5, 0.5);
        const green = rgb(0.15, 0.5, 0.15);
        
        // Helper function to add centered text
        const addCenteredText = (text: string, font = helveticaFont, fontSize = 10) => {
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const x = (page.getWidth() - textWidth) / 2;
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font
          });
          y -= lineHeight;
        };
        
        // Helper function to draw a section header
        const drawSectionHeader = (title: string) => {
          // Draw background
          page.drawRectangle({
            x: margin,
            y: y - headerHeight + lineHeight,
            width: width,
            height: headerHeight,
            color: lightGrey,
            borderColor: darkGrey,
            borderWidth: 0.5,
          });
          
          // Draw title
          page.drawText(title, {
            x: margin + 5,
            y: y + 5,
            size: 10,
            font: helveticaBold,
          });
          
          y -= headerHeight;
        };
        
        // Helper function to draw a field in a table
        const drawTableField = (label: string, value: string | number | null | undefined, colX: number, colWidth: number, bold = false) => {
          page.drawText(label, {
            x: colX,
            y,
            size: 9,
            font: helveticaBold,
          });
          
          page.drawText(String(value || "-"), {
            x: colX,
            y: y - smallLineHeight,
            size: 9,
            font: bold ? helveticaBold : helveticaFont,
          });
        };
        
        // Helper function to draw a row with multiple columns
        const drawTableRow = (items: Array<{label: string, value: string | number | null | undefined, bold?: boolean}>, colCount = 2) => {
          const colWidth = width / colCount;
          
          items.forEach((item, index) => {
            const colX = margin + (colWidth * index);
            drawTableField(item.label, item.value, colX, colWidth, item.bold);
          });
          
          y -= lineHeight * 2;
        };
        
        // Helper function to draw a checkbox or bullet
        const drawIndicator = (isChecked: boolean, label: string, x: number) => {
          // Draw circle
          const circleRadius = 3;
          page.drawCircle({
            x: x + circleRadius,
            y: y - smallLineHeight/2,
            size: circleRadius,
            borderColor: black,
            borderWidth: 0.5,
            color: isChecked ? green : lightGrey,
          });
          
          // Draw label
          page.drawText(label, {
            x: x + circleRadius*2 + 4,
            y: y - smallLineHeight/2 - 4,
            size: 8,
            font: helveticaFont,
          });
        };
        
        // Add header
        addCenteredText('EMEAHSS, KONDOTTY, THURAKKAL P.O.', helveticaBold, 14);
        addCenteredText('APPLICATION FOR PLUS ONE ADMISSION 2025-26(COMMUNITY QUOTA)', helveticaBold, 12);
        
        // Add submission date
        page.drawText(`Submission Date: ${new Date(application.created_at).toLocaleDateString()}`, {
          x: page.getWidth() - margin - 150,
          y: y - 5,
          size: 8,
          font: helveticaFont,
        });
        
        y -= 20; // Space after header
        
        // Personal Information Section
        drawSectionHeader('Personal Information');
        
        // Calculate column positions for 2 columns per row
        const col1X = margin + 5;
        const col2X = margin + width/2 + 5;
        
        // Row 1
        drawTableField('Name:', application.applicant_name, col1X, width/2, true);
        drawTableField("Mother's Name:", application.mother_name, col2X, width/2);
        y -= lineHeight * 2;
        
        // Row 2
        drawTableField('Gender:', application.gender, col1X, width/2);
        drawTableField("Father's Name:", application.father_name, col2X, width/2);
        y -= lineHeight * 2;
        
        // Row 3
        drawTableField('Date of Birth:', application.date_of_birth ? new Date(application.date_of_birth).toLocaleDateString() : '-', col1X, width/2);
        drawTableField('Mobile:', application.mobile_number, col2X, width/2);
        y -= lineHeight * 2;
        
        // Row 4
        drawTableField('Religion:', application.religion, col1X, width/2);
        drawTableField('WhatsApp:', application.whatsapp_number, col2X, width/2);
        y -= lineHeight * 2;
        
        // Row 5
        drawTableField('Single Window No:', application.single_window_appln_no, col1X, width/2);
        drawTableField('Fee Paid:', application.fee_paid, col2X, width/2);
        y -= lineHeight * 2.5;
        
        // Address Information Section
        drawSectionHeader('Address Information');
        
        // Row 1
        drawTableField('House:', application.house_name, col1X, width/4);
        drawTableField('Post Office:', application.post_office, col1X + width/4, width/4);
        drawTableField('Panchayath:', application.panchayath_municipality, col1X + width/2, width/4);
        y -= lineHeight * 2;
        
        // Row 2
        drawTableField('Address:', application.permanent_address, col1X, width/2);
        drawTableField('Taluk:', application.taluk, col2X, width/4);
        drawTableField('Payment Date:', application.payment_date ? new Date(application.payment_date).toLocaleDateString() : '-', col2X + width/4, width/4);
        y -= lineHeight * 2.5;
        
        // Academic Information Section
        drawSectionHeader('Academic Information');
        
        // Row 1
        drawTableField('Qualifying Exam:', application.qualifying_exam, col1X, width/3);
        drawTableField('Register Number:', application.register_number, col1X + width/3, width/3, true);
        y -= lineHeight * 2;
        
        // Row 2
        drawTableField('Exam Type:', application.exam_type, col1X, width/3);
        drawTableField('School Name:', application.school_name, col1X + width/3, width/3 * 2);
        y -= lineHeight * 2;
        
        // Row 3
        drawTableField('Exam Year:', application.exam_year, col1X, width/3);
        y -= lineHeight * 2.5;
        
        // Course Preferences Section
        drawSectionHeader('Course Preferences');
        
        // Add this line to move y-coordinate up a bit to reduce spacing
        y += 15;
        
        // Draw course preferences
        if (application.course_preferences && application.course_preferences.length > 0) {
          application.course_preferences.forEach((pref: any, index: number) => {
            page.drawText(`${index + 1}. ${pref.code} - ${pref.name}`, {
              x: col1X,
              y: y - smallLineHeight,
              size: 9,
              font: helveticaFont,
            });
            y -= smallLineHeight + 5; // Add 5 points of spacing between entries
          });
        } else {
          y -= smallLineHeight;
        }
        
        y -= 20; // Add space before Academic Grades section
        
        // Academic Grades Section
        drawSectionHeader('Academic Grades');
        
        const gradeFields = application.exam_type === 'sslc' ? 
          (application.subject_grades || {}) : 
          (application.cbse_marks || {});
        
        if (application.exam_type === 'sslc') {
          // SSLC Grades
          // Set up grid with 5 columns in first row, 4 in second
          const gradeColWidth = width / 5;
          
          // Row 1 of grades
          page.drawText('English', { x: col1X, y, size: 9, font: helveticaBold });
          page.drawText('Malayalam', { x: col1X + gradeColWidth, y, size: 9, font: helveticaBold });
          page.drawText('Hindi', { x: col1X + gradeColWidth * 2, y, size: 9, font: helveticaBold });
          page.drawText('Social Sci', { x: col1X + gradeColWidth * 3, y, size: 9, font: helveticaBold });
          page.drawText('Physics', { x: col1X + gradeColWidth * 4, y, size: 9, font: helveticaBold });
          
          y -= smallLineHeight;
          
          // Values for Row 1
          page.drawText(gradeFields.english || '-', { x: col1X, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.malayalam || '-', { x: col1X + gradeColWidth, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.hindi || '-', { x: col1X + gradeColWidth * 2, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.social_science || '-', { x: col1X + gradeColWidth * 3, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.physics || '-', { x: col1X + gradeColWidth * 4, y, size: 9, font: helveticaFont });
          
          y -= lineHeight;
          
          // Row 2 of grades
          page.drawText('Chemistry', { x: col1X, y, size: 9, font: helveticaBold });
          page.drawText('Biology', { x: col1X + gradeColWidth, y, size: 9, font: helveticaBold });
          page.drawText('Maths', { x: col1X + gradeColWidth * 2, y, size: 9, font: helveticaBold });
          page.drawText('IT', { x: col1X + gradeColWidth * 3, y, size: 9, font: helveticaBold });
          
          y -= smallLineHeight;
          
          // Values for Row 2
          page.drawText(gradeFields.chemistry || '-', { x: col1X, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.biology || '-', { x: col1X + gradeColWidth, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.maths || '-', { x: col1X + gradeColWidth * 2, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.information_technology || '-', { x: col1X + gradeColWidth * 3, y, size: 9, font: helveticaFont });
        } else {
          // CBSE Marks table
          const gradeColWidth = width / 5;
          
          // Headers
          page.drawText('English', { x: col1X, y, size: 9, font: helveticaBold });
          page.drawText('Language', { x: col1X + gradeColWidth, y, size: 9, font: helveticaBold });
          page.drawText('Social Sci', { x: col1X + gradeColWidth * 2, y, size: 9, font: helveticaBold });
          page.drawText('Science', { x: col1X + gradeColWidth * 3, y, size: 9, font: helveticaBold });
          page.drawText('Maths', { x: col1X + gradeColWidth * 4, y, size: 9, font: helveticaBold });
          
          y -= smallLineHeight;
          
          // Values
          page.drawText(gradeFields.english || '-', { x: col1X, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.language || '-', { x: col1X + gradeColWidth, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.social_science || '-', { x: col1X + gradeColWidth * 2, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.science || '-', { x: col1X + gradeColWidth * 3, y, size: 9, font: helveticaFont });
          page.drawText(gradeFields.maths || '-', { x: col1X + gradeColWidth * 4, y, size: 9, font: helveticaFont });
        }
        
        y -= lineHeight + 10;
        
        // Add a page break/new page for Bonus Points & Eligibility
        if (y < 350) {
          // Not enough space, add new page
          page = pdfDoc.addPage([595.28, 841.89]);
          y = page.getHeight() - margin;
        }
        
        // Bonus Points & Eligibility Section
        drawSectionHeader('Bonus Points & Eligibility');
        
        // NCC & Eligibility
        page.drawText('NCC & Eligibility', { x: col1X, y, size: 9, font: helveticaBold });

        // Get bonus points data
        const bonusPoints = application.bonus_points || {};
        const eligibility = application.eligibility || {};
        
        // First row of indicators
        drawIndicator(bonusPoints.ncc_type?.ncc || false, 'NCC', col1X);
        drawIndicator(bonusPoints.ncc_type?.student_police_cadet || false, 'Student Police Cadet', col1X + 100);
        y -= smallLineHeight + 5;
        
        // Second row of indicators
        drawIndicator(bonusPoints.ncc_type?.scouts_guides || false, 'Scouts & Guides', col1X);
        drawIndicator(eligibility.little_kites || false, 'Little Kites', col1X + 100);
        y -= smallLineHeight + 5;
        
        // Third row of indicators
        drawIndicator(eligibility.jrc || false, 'JRC', col1X);
        drawIndicator(eligibility.nss || false, 'NSS', col1X + 100);
        y -= lineHeight + 5;
        
        // Other Status
        y -= smallLineHeight + 5;
        page.drawText('Other Status', { x: col1X, y, size: 9, font: helveticaBold });
        
        // Status indicators
        drawIndicator(bonusPoints.dependent_jawans_killed || false, 'Dependent of Jawans killed in action', col1X);
        y -= smallLineHeight + 3;
        
        drawIndicator(bonusPoints.dependent_jawans_service || false, 'Dependent of Jawans in Service', col1X);
        y -= smallLineHeight + 3;
        
        // National Talent Search Examination as text
        page.drawText(
          `Whether qualified in the National/State Level Test for the National Talent Search Examination: ${application.national_state_test ? "Yes" : "No"}`,
          {
            x: col1X,
            y: y - smallLineHeight / 2 - 4, // Adjusted y for proper alignment
            size: 8,
            font: helveticaFont,
          }
        );
        y -= smallLineHeight + 6;
        
        // Clubs count
        page.drawText(`Clubs: ${eligibility.clubs_count || 0}`, {
          x: col1X,
          y,
          size: 9,
          font: helveticaFont,
        });
        y -= lineHeight + 10;
        
        // Sports Participation
        const sportsParticipation = application.sports_participation || {};
        const sportsStateLevel = sportsParticipation.state_level || 0;
        const sportsDistrictLevel = sportsParticipation.district_level || {};
        
        // Sports Participation Section
        page.drawText('Sports Participation', { x: col1X, y, size: 9, font: helveticaBold });
        y -= smallLineHeight;
        
        // Create table for sports participation
        page.drawText('Level', { x: col1X, y, size: 8, font: helveticaBold });
        page.drawText('Total', { x: col1X + 150, y, size: 8, font: helveticaBold });
        y -= smallLineHeight;
        
        page.drawText('State Level', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(sportsStateLevel), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('District Level', { x: col1X, y, size: 8, font: helveticaBold });
        y -= smallLineHeight;
        
        page.drawText('A Grade', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(sportsDistrictLevel.a_grade || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('B Grade', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(sportsDistrictLevel.b_grade || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('C Grade', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(sportsDistrictLevel.c_grade || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('Participation', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(sportsDistrictLevel.participation || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= lineHeight + 10;
        
        // Kalolsavam Participation
        const kalolsavamParticipation = application.kalolsavam_participation || {};
        const kalolsavamStateLevel = kalolsavamParticipation.state_level || 0;
        const kalolsavamDistrictLevel = kalolsavamParticipation.district_level || {};
        
        page.drawText('Kalolsavam Participation', { x: col1X, y, size: 9, font: helveticaBold });
        y -= smallLineHeight;
        
        // Create table for kalolsavam participation
        page.drawText('Level', { x: col1X, y, size: 8, font: helveticaBold });
        page.drawText('Total', { x: col1X + 150, y, size: 8, font: helveticaBold });
        y -= smallLineHeight;
        
        page.drawText('State Level', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(kalolsavamStateLevel), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('District Level', { x: col1X, y, size: 8, font: helveticaBold });
        y -= smallLineHeight;
        
        page.drawText('A Grade', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(kalolsavamDistrictLevel.a_grade || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('B Grade', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(kalolsavamDistrictLevel.b_grade || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('C Grade', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(kalolsavamDistrictLevel.c_grade || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        y -= smallLineHeight;
        
        page.drawText('Participation', { x: col1X + 10, y, size: 8, font: helveticaFont });
        page.drawText(String(kalolsavamDistrictLevel.participation || 0), { x: col1X + 150, y, size: 8, font: helveticaFont });
        
        y -= lineHeight + 10; // Add space before Co-curricular Activities

        // Add a page break check before Co-curricular Activities
        if (y < 200) { // Adjust threshold as needed
          page = pdfDoc.addPage([595.28, 841.89]);
          y = page.getHeight() - margin;
        }

        // Co-curricular Activities Section
        const coCurricularActivities = application.co_curricular_activities || {};
        if (Object.keys(coCurricularActivities).length > 0) {
          drawSectionHeader('Co-curricular Activities');
          y += 10; // Adjust space after header

          // Table Headers
          const activityColX = col1X;
          const gradeColXStart = col1X + 150; // Start position for grade columns
          const gradeColWidth = (width - 150) / 5; // Width for each grade column

          page.drawText('Activity', { x: activityColX, y, size: 9, font: helveticaBold });
          page.drawText('A Grade', { x: gradeColXStart, y, size: 9, font: helveticaBold });
          page.drawText('B Grade', { x: gradeColXStart + gradeColWidth, y, size: 9, font: helveticaBold });
          page.drawText('C Grade', { x: gradeColXStart + gradeColWidth * 2, y, size: 9, font: helveticaBold });
          page.drawText('D Grade', { x: gradeColXStart + gradeColWidth * 3, y, size: 9, font: helveticaBold });
          page.drawText('E Grade', { x: gradeColXStart + gradeColWidth * 4, y, size: 9, font: helveticaBold });
          y -= lineHeight;

          for (const [activityKey, grades] of Object.entries(coCurricularActivities)) {
            if (y < margin + lineHeight) { // Check for page break
              page = pdfDoc.addPage([595.28, 841.89]);
              y = page.getHeight() - margin;
              // Redraw headers on new page if needed
              page.drawText('Activity', { x: activityColX, y, size: 9, font: helveticaBold });
              page.drawText('A Grade', { x: gradeColXStart, y, size: 9, font: helveticaBold });
              page.drawText('B Grade', { x: gradeColXStart + gradeColWidth, y, size: 9, font: helveticaBold });
              page.drawText('C Grade', { x: gradeColXStart + gradeColWidth * 2, y, size: 9, font: helveticaBold });
              page.drawText('D Grade', { x: gradeColXStart + gradeColWidth * 3, y, size: 9, font: helveticaBold });
              page.drawText('E Grade', { x: gradeColXStart + gradeColWidth * 4, y, size: 9, font: helveticaBold });
              y -= lineHeight;
            }

            const activityName = activityKey
              .replace(/_/g, ' ')
              .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word
            
            const currentGrades = grades as { a?: number; b?: number; c?: number; d?: number; e?: number; };

            page.drawText(activityName, { x: activityColX, y, size: 8, font: helveticaFont });
            
            // Manually center grade text
            const drawCenteredGrade = (text: string, columnX: number, columnWidth: number) => {
              const textWidth = helveticaFont.widthOfTextAtSize(text, 8);
              page.drawText(text, { x: columnX + (columnWidth - textWidth) / 2, y, size: 8, font: helveticaFont });
            };

            drawCenteredGrade(String(currentGrades.a || 0), gradeColXStart, gradeColWidth);
            drawCenteredGrade(String(currentGrades.b || 0), gradeColXStart + gradeColWidth, gradeColWidth);
            drawCenteredGrade(String(currentGrades.c || 0), gradeColXStart + gradeColWidth * 2, gradeColWidth);
            drawCenteredGrade(String(currentGrades.d || 0), gradeColXStart + gradeColWidth * 3, gradeColWidth);
            drawCenteredGrade(String(currentGrades.e || 0), gradeColXStart + gradeColWidth * 4, gradeColWidth);
            y -= lineHeight;
          }
        }
        y -= lineHeight; // Extra space after the section

        // Draw signature line
        const signatureY = 90;
        page.drawLine({
          start: { x: page.getWidth() - margin - 150, y: signatureY },
          end: { x: page.getWidth() - margin, y: signatureY },
          thickness: 1,
          color: black,
        });
        
        page.drawText('Signature of Applicant', {
          x: page.getWidth() - margin - 120,
          y: signatureY - 15,
          size: 8,
          font: helveticaFont,
        });
        
        // Add application ID in footer
        page.drawText(`Application ID: ${application.id}`, {
          x: margin,
          y: 40,
          size: 7,
          font: helveticaFont,
          color: darkGrey,
        });
        
        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        
        // Add to zip
        const filename = `${application.register_number || application.id}_${application.applicant_name.replace(/\s+/g, '_')}.pdf`;
        zip.file(filename, pdfBytes);
        
      } catch (error) {
        console.error(`Error generating PDF for application ${application.id}:`, error);
        // Skip this application and continue with others
      }
    }
    
    // Generate the zip file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    
    // Return the zip file
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="EMEAHSS_Applications_${new Date().toISOString().split('T')[0]}.zip"`,
      },
    });
  } catch (error) {
    console.error('Error exporting PDFs:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate PDF files' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 