const Item = require('../models/items');
const Purchase = require('../models/purchases');



async function showDashboard(req, res) {
    const allItems = await Item.getAll();
    const itemsList = allItems.map(item => {
        return `
        <div class="row text-center text-white">
        <div class="col-sm border bg-secondary">
          ${item.name}
        </div>
        <div class="col-sm border bg-secondary">
          ${item.sku}
        </div>
        <div class="col-sm border bg-secondary">
          ${item.leadTime}
        </div>
        <div class="col-sm border bg-secondary">
          ${item.wholesale}
        </div>
        <div class="col-sm border bg-secondary">
          ${item.retail}
        </div>
        <div class="col-sm border bg-secondary">
          ${item.stock}
        </div>
        <div class="col-sm border bg-secondary">
          ${item.simulatedStock}
        </div>
        <div class="col-sm border bg-secondary">
          ${item.location_id}
        </div>
        </div>
        `
       });
       const allItemsNoSpaces = allItems.map(item => item.name.replace(/ /g, '-'));

       const itemChoices = allItemsNoSpaces.map(item => {
         return `
          <option name=${item} value=${item}>${item.replace(/-/g, ' ')}</option>

         `
       });
       let sum = 0;
       if (req.session.sum) {
          sum = req.session.sum;
       } else {
          sum = '';
       }
       res.render('dashboard', {
           locals: {
              items: itemsList.join(''),
              choices: itemChoices.join(''),
              revenueTotal: req.session.sum
              
           }
       });
}

async function simulatePurchase(req, res) {

 // 1. needs to deduct x amount of stock from whatever item was just purchased
  let i = 0;
  console.log(req.body);
  const itemName = req.body.itemSelect.replace(/-/g, ' ');
  const itemInstance = await Item.getByName(itemName);
  while (i < req.body.customerCount) {
    const itemID = itemInstance.id;

    await Item.adjustStock(-1, itemID);

    const date = '2019-04-10';

  
  // 2. needs to create a record of the purchase in purchases table
  
  await Purchase.newPurchase(itemID, 2, 1, date);
  i++;
  }
  // retrieve sum of revenues for the day
  let sum = await Purchase.totalRevenue()
  req.session.sum = sum;
  req.session.save(() => {
    res.redirect('/');
  })


}

async function resetSim(req, res) {

  await Purchase.deleteAll();
  req.session.sum = '';
  req.session.save();

  // needs to update numbers in simulated stock column to match original stock
  const allItems = await Item.getAll();

  // each of the items in allItems needs to call resetStock
  const arrayOfPromises = allItems.map(async item => {
    return await item.resetStock()
  })

  Promise.all(arrayOfPromises).then(values => {
    
    res.redirect('/');
    
  })


}

module.exports = {
  showDashboard,
  simulatePurchase,
  resetSim
  
}

