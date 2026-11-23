// Test actions follow the visible navigation instead of clicking hidden controls.
exports.click = async function(page, selector) {
 if(selector==='#modern-menu')selector='#modern-settings';
 if(selector==='#craft-workshop > summary'){
  await page.click('#hover-menu-toggle');await page.click('[data-open-section=workshop]');return;
 }
 const item=page.locator(selector);
 if(await item.count()&&await item.evaluate(el=>!!el.closest('#hover-menu-items'))&&await page.locator('#hover-menu-items').isHidden())await page.click('#hover-menu-toggle');
 await page.click(selector);
};
