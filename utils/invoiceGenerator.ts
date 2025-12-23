import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

export interface InvoiceData {
  orderId: string;
  date: string;
  items: Array<{
    name: string;
    size: string;
    price: number; // Offer price
    mrp: number; // Original price
    quantity: number;
  }>;
  totalAmount: number;
  storeInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

// Generate HTML content for invoice
const getInvoiceHTML = (data: InvoiceData): string => {
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 50px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 50px; border-bottom: 3px solid #007AFF; padding-bottom: 30px; }
          .store-name { font-size: 32px; font-weight: bold; color: #007AFF; margin-bottom: 8px; letter-spacing: 1px; }
          .store-info { font-size: 15px; color: #555; margin-bottom: 4px; }
          .invoice-title { font-size: 28px; font-weight: bold; margin-top: 25px; text-transform: uppercase; letter-spacing: 2px; color: #333; }
          .order-meta { margin-bottom: 40px; display: flex; justify-content: space-between; font-size: 15px; background: #f8f9fa; padding: 15px; borderRadius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { text-align: left; border-bottom: 2px solid #eee; padding: 15px 10px; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
          td { padding: 20px 10px; border-bottom: 1px solid #f1f1f1; }
          .item-name { font-weight: bold; font-size: 17px; color: #222; }
          .item-details { font-size: 13px; color: #777; margin-top: 4px; }
          .amount { text-align: right; font-weight: bold; }
          .mrp-price { text-decoration: line-through; color: #999; font-size: 12px; margin-bottom: 2px; }
          .offer-badge { color: #34C759; font-size: 12px; font-weight: bold; }
          .total-section { border-top: 2px solid #eee; padding-top: 25px; text-align: right; }
          .total-row { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 10px; }
          .total-label { font-size: 16px; color: #666; margin-right: 15px; }
          .total-value { font-size: 18px; font-weight: 600; color: #333; width: 120px; }
          .savings-label { font-size: 16px; color: #34C759; margin-right: 15px; font-weight: 600; }
          .savings-value { font-size: 18px; font-weight: bold; color: #34C759; width: 120px; }
          .grand-total-label { font-size: 20px; font-weight: bold; color: #333; margin-right: 15px; }
          .grand-total-amount { font-size: 32px; font-weight: bold; color: #007AFF; width: 120px; }
          .footer { margin-top: 60px; text-align: center; font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">${data.storeInfo.name}</div>
          <div class="store-info">${data.storeInfo.address}</div>
          <div class="store-info">Phone: ${data.storeInfo.phone}</div>
          <div class="invoice-title">Invoice</div>
        </div>

        <div class="order-meta">
          <div><strong>Order ID:</strong> #${data.orderId}</div>
          <div><strong>Date:</strong> ${data.date}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">MRP</th>
              <th style="text-align: right;">Offer (%)</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data.items
              .map(
                (item) => `
              <tr>
                <td>
                  <div class="item-name">${item.name}</div>
                  <div class="item-details">Size: ${item.size}</div>
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right; color: #999; text-decoration: line-through; font-size: 14px;">
                  ₹${(item.mrp || item.price).toLocaleString("en-IN")}
                </td>
                <td style="text-align: right; color: #34C759; font-weight: bold; font-size: 14px;">
                  ${Math.round(
                    (((item.mrp || item.price) - item.price) /
                      (item.mrp || item.price)) *
                      100
                  )}% OFF
                </td>
                <td style="text-align: right; font-weight: bold; font-size: 16px; color: #007AFF;">
                  ₹${(item.price * item.quantity).toLocaleString("en-IN")}
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span class="total-label">Subtotal (MRP):</span>
            <span class="total-value">₹${data.items
              .reduce(
                (sum, item) => sum + (item.mrp || item.price) * item.quantity,
                0
              )
              .toLocaleString("en-IN")}</span>
          </div>
          <div class="total-row">
            <span class="savings-label">Total Savings:</span>
            <span class="savings-value">- ₹${data.items
              .reduce(
                (sum, item) =>
                  sum + ((item.mrp || item.price) - item.price) * item.quantity,
                0
              )
              .toLocaleString("en-IN")}</span>
          </div>
          <div class="total-row" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
            <span class="grand-total-label">Grand Total:</span>
            <span class="grand-total-amount">₹${data.totalAmount.toLocaleString(
              "en-IN"
            )}</span>
          </div>
        </div>

        <div class="footer">
          <p style="font-weight: bold; color: #555;">Thank you for shopping with American Tourister!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p>&copy; ${new Date().getFullYear()} Vaishnavi Sales. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;
};

// Download invoice to device storage
export const downloadInvoice = async (data: InvoiceData): Promise<void> => {
  try {
    const html = getInvoiceHTML(data);
    const { uri } = await Print.printToFileAsync({ html });

    // Create filename
    const fileName = `Invoice_${data.orderId}.pdf`;

    // Check if StorageAccessFramework is available (Android only)
    const SAF = (FileSystem as any).StorageAccessFramework;

    if (Platform.OS === "android" && SAF) {
      try {
        const permissions = await SAF.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: (FileSystem as any).EncodingType?.Base64 || "base64",
          });

          const fileUri = await SAF.createFileAsync(
            permissions.directoryUri,
            fileName,
            "application/pdf"
          );

          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: (FileSystem as any).EncodingType?.Base64 || "base64",
          });

          Alert.alert("Success", "Invoice saved to selected folder");
          return;
        }
      } catch (safError) {
        console.warn("SAF Error, falling back to sharing:", safError);
      }
    }

    // Fallback for iOS or if SAF fails/is unavailable on Android
    // Sharing.shareAsync allows "Save to Files" which is the standard download on mobile
    await Sharing.shareAsync(uri, {
      UTI: ".pdf",
      mimeType: "application/pdf",
      dialogTitle: "Download Invoice",
    });
  } catch (error: any) {
    console.error("Error downloading invoice:", error);
    Alert.alert(
      "Download Failed",
      error.message || "An unknown error occurred"
    );
    throw error;
  }
};

// Get HTML for displaying in WebView (for order bill viewing)
export const getInvoiceHTMLForDisplay = (data: InvoiceData): string => {
  return getInvoiceHTML(data);
};

// Legacy function for sharing (kept for compatibility)
export const generateInvoice = async (data: InvoiceData) => {
  try {
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};
