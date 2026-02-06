// Configuration
const SHEET_NAMES = ["dorms", "events"]; // Replace with your actual sheet names
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

/**
 * Fetches data from a specific sheet and returns it as an array of objects
 * using the first row as headers/labels
 */
function getSheetDataAsJSON(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    return [];
  }
  
  // Use first row as headers
  const headers = data[0];
  const result = [];
  
  // Convert each row to an object with headers as keys
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowObject = {};
    
    for (let j = 0; j < headers.length; j++) {
      rowObject[headers[j]] = row[j];
    }
    
    result.push(rowObject);
  }
  
  return result;
}

/**
 * HTTP GET endpoint that returns all sheet data as JSON
 */
function doGet(e) {
  try {
    const response = {};
    
    // Fetch data from all configured sheets
    for (const sheetName of SHEET_NAMES) {
      response[sheetName] = getSheetDataAsJSON(sheetName);
    }
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Optional: Get data from a specific sheet only
 * Usage: /exec?sheet=Sheet1
 */
function doGet(e) {
  try {
    const requestedSheet = e.parameter.sheet;
    const response = {};
    
    if (requestedSheet) {
      // Return data for specific sheet
      if (!SHEET_NAMES.includes(requestedSheet)) {
        return ContentService.createTextOutput(JSON.stringify({
          error: `Sheet "${requestedSheet}" not found. Available sheets: ${SHEET_NAMES.join(", ")}`
        }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      response[requestedSheet] = getSheetDataAsJSON(requestedSheet);
    } else {
      // Return data from all sheets
      for (const sheetName of SHEET_NAMES) {
        response[sheetName] = getSheetDataAsJSON(sheetName);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify(response, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
