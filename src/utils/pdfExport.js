import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Generate PDF report with map screenshot and fire risk data
 * @param {HTMLElement} mapElement - Map container element
 * @param {Object} data - Additional data for the report
 */
export const generatePDFReport = async (mapElement, data = {}) => {
  try {
    const {
      selectedLocation,
      weatherData,
      riskScore,
      timelineValue,
      currentPrediction,
    } = data

    // Create PDF document
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    // Add header
    pdf.setFillColor(25, 118, 210)
    pdf.rect(0, 0, pageWidth, 30, 'F')
    
    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Forest Fire Risk Report', 15, 15)
    
    // Subtitle
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    const reportDate = new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
    pdf.text(`Generated: ${reportDate}`, 15, 22)

    // Location info
    if (selectedLocation) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Location: ${selectedLocation.name || 'Unknown'}`, 15, 28)
    }

    // Capture map screenshot
    let yPosition = 35

    if (mapElement) {
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Map View', 15, yPosition)
      yPosition += 7

      try {
        const canvas = await html2canvas(mapElement, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        const imgWidth = pageWidth - 30
        const imgHeight = (canvas.height * imgWidth) / canvas.width
        
        // Add map image
        pdf.addImage(imgData, 'JPEG', 15, yPosition, imgWidth, imgHeight)
        yPosition += imgHeight + 10
      } catch (error) {
        console.error('Screenshot error:', error)
        pdf.setFontSize(10)
        pdf.text('Map screenshot unavailable', 15, yPosition)
        yPosition += 10
      }
    }

    // Add new page if needed
    if (yPosition > pageHeight - 60) {
      pdf.addPage()
      yPosition = 20
    }

    // Risk Assessment Section
    pdf.setFillColor(245, 245, 245)
    pdf.rect(15, yPosition, pageWidth - 30, 50, 'F')
    yPosition += 5

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0, 0, 0)
    pdf.text('Risk Assessment', 20, yPosition)
    yPosition += 8

    // Risk Score
    if (riskScore !== undefined) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      
      const riskLevel = riskScore < 30 ? 'Safe' : riskScore < 60 ? 'Medium' : riskScore < 80 ? 'High' : 'Critical'
      const riskColor = riskScore < 30 ? [76, 175, 80] : riskScore < 60 ? [255, 160, 0] : riskScore < 80 ? [244, 67, 54] : [183, 28, 28]
      
      pdf.text(`Current Risk Score: `, 20, yPosition)
      pdf.setTextColor(...riskColor)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${Math.round(riskScore)}%`, 75, yPosition)
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`(${riskLevel})`, 95, yPosition)
      yPosition += 8
    }

    // Weather Conditions
    if (weatherData?.current) {
      pdf.setFontSize(12)
      pdf.text(`Temperature: ${Math.round(weatherData.current.temperature)}°C`, 20, yPosition)
      yPosition += 6
      pdf.text(`Humidity: ${weatherData.current.humidity}%`, 20, yPosition)
      yPosition += 6
      pdf.text(`Wind Speed: ${Math.round(weatherData.current.windSpeed)} km/h`, 20, yPosition)
      yPosition += 6
      pdf.text(`Wind Direction: ${weatherData.current.windDirection}°`, 20, yPosition)
      yPosition += 8
    }

    // Timeline Prediction
    if (timelineValue > 0 && currentPrediction) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Prediction Timeline: +${timelineValue} hours`, 20, yPosition)
      yPosition += 6
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Predicted Risk: ${Math.round(currentPrediction.risk)}%`, 20, yPosition)
      yPosition += 6
      pdf.text(`Spread Radius: ${currentPrediction.spread}`, 20, yPosition)
      yPosition += 6
      pdf.text(`Direction: ${currentPrediction.direction}`, 20, yPosition)
    }

    yPosition += 10

    // Footer
    const footerY = pageHeight - 15
    pdf.setFillColor(26, 26, 26)
    pdf.rect(0, footerY - 5, pageWidth, 20, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Forest Fire Prediction System - Powered by Open-Meteo Weather API', pageWidth / 2, footerY, { align: 'center' })
    pdf.text(`© 2025 - Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 4, { align: 'center' })

    // Save PDF
    const fileName = `fire-risk-report-${Date.now()}.pdf`
    pdf.save(fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error('PDF generation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Take screenshot of an element and download as image
 * @param {HTMLElement} element - Element to screenshot
 * @param {string} filename - Output filename
 */
export const downloadScreenshot = async (element, filename = 'map-screenshot.png') => {
  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2,
    })

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    })

    return { success: true, filename }
  } catch (error) {
    console.error('Screenshot error:', error)
    return { success: false, error: error.message }
  }
}

export default {
  generatePDFReport,
  downloadScreenshot,
}
