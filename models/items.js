const db = require('./conn');

class Item {
    constructor(id, name, sku, lead_time, wholesale, retail, stock, simulated_stock, location_id) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.leadTime = lead_time;
        this.wholesale = wholesale;
        this.retail = retail;
        this.stock = stock;
        this.simulatedStock = simulated_stock;
        this.location_id = location_id;
    }

    static getAll() {
        return db.any(`
            select * from items
        `)
        .then(itemsData => {
            const arrayOfInstances = itemsData.map(item => new Item (item.id,
                    item.name,
                    item.sku,
                    item.lead_time,
                    item.wholesale,
                    item.retail,
                    item.stock,
                    item.simulated_stock,
                    item.location_id
            ))
            return arrayOfInstances;
        });
    }

    static adjustStock(qty, itemID) {

        // delete/add qty to specific item's stock
        return db.result(`
        UPDATE items
        SET simulated_stock = simulated_stock + ${qty}
        WHERE id=${itemID}
        `)


    }

    resetStock() {

        // resets specific item's simulated stock back to value of original stock
        return db.result(`
        UPDATE items
        SET simulated_stock = stock
        WHERE id=${this.id}
        `)
    }

    static getByName(name) {
        return db.one(`
        Select * from items
        where name ilike '${name}'
        `)
        .then(item => {
            console.log(item);
            const itemInstance = new Item(item.id,
                item.name,
                item.sku,
                item.lead_time,
                item.wholesale,
                item.retail,
                item.stock,
                item.simulated_stock,
                item.location_id

            )
            return itemInstance;
        })
    }

}

module.exports = Item;