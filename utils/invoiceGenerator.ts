import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export interface InvoiceData {
  orderId: string;
  date: string;
  items: Array<{
    name: string;
    size: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  storeInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

export const generateInvoice = async (data: InvoiceData) => {
  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #007AFF; padding-bottom: 20px; }
          .store-name { font-size: 28px; font-weight: bold; color: #007AFF; margin-bottom: 5px; }
          .store-info { font-size: 14px; color: #666; }
          .invoice-title { font-size: 24px; font-weight: bold; margin-top: 20px; text-transform: uppercase; }
          .order-meta { margin-bottom: 30px; display: flex; justify-content: space-between; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; border-bottom: 1px solid #eee; padding: 12px 0; color: #666; font-size: 12px; text-transform: uppercase; }
          td { padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
          .item-name { font-weight: bold; font-size: 16px; }
          .item-details { font-size: 12px; color: #888; }
          .amount { text-align: right; font-weight: bold; }
          .total-section { border-top: 2px solid #eee; padding-top: 20px; text-align: right; }
          .total-label { font-size: 18px; color: #666; }
          .total-amount { font-size: 28px; font-weight: bold; color: #007AFF; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
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
              <th style="text-align: right;">Price</th>
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
                <td style="text-align: right;">₹${item.price.toLocaleString(
                  "en-IN"
                )}</td>
                <td style="text-align: right;">₹${(
                  item.price * item.quantity
                ).toLocaleString("en-IN")}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <span class="total-label">Grand Total:</span>
          <div class="total-amount">₹${data.totalAmount.toLocaleString(
            "en-IN"
          )}</div>
        </div>

        <div class="footer">
          <p>Thank you for shopping with American Tourister!</p>
          <p>This is a computer-generated invoice.</p>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { UTI: ".pdf", mimeType: "application/pdf" });
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
};
