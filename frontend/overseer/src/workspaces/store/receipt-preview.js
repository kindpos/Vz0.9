export function renderReceiptPreview(info = {}) {
  const container = document.createElement('div');
  container.className = 'receipt-paper';
  container.style.cssText = `
    width: 300px;
    min-height: 400px;
    margin-left: 40px;
  `;

  const update = (newInfo) => {
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-weight: bold; font-size: 18px;">${newInfo.restaurant_name || 'KINDPOS'}</div>
        <div>${newInfo.address_line_1 || ''}</div>
        <div>${newInfo.address_line_2 || ''}</div>
        <div>${newInfo.city || ''} ${newInfo.state || ''} ${newInfo.zip || ''}</div>
        <div>${newInfo.phone || ''}</div>
      </div>
      <div style="border-top: 1px dashed #333; margin: 10px 0;"></div>
      <div style="margin: 20px 0;">
        <div style="display: flex; justify-content: space-between;">
          <span>1 Margherita Pizza</span>
          <span>$15.99</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>1 Soda</span>
          <span>$2.50</span>
        </div>
      </div>
      <div style="border-top: 1px dashed #333; margin: 10px 0;"></div>
      <div style="display: flex; justify-content: space-between; font-weight: bold;">
        <span>TOTAL</span>
        <span>$18.49</span>
      </div>
      <div style="text-align: center; margin-top: 40px; font-size: 12px;">
        THANK YOU!
      </div>
    `;
  };

  update(info);
  container.update = update;
  return container;
}
