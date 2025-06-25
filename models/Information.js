const connection = require('./Connection');
class Information {

    static fill(obj = {}) {
        console.log('obj', obj)
        const data = new Information()
        for (const key in obj) {
            data[key] = obj[key];
        }
        return data
    }

    fill(obj = {}) {
        for (const key in obj) {
            this[key] = obj[key];
        }
    }

    static async insert(data) {
        const sql = 'INSERT INTO personal_information (full_name, email, phone, avatar) VALUES (?, ?, ?, ?)';
        const values = [
            data.full_name || null,
            data.email || null,
            data.phone || null,
            data.avatar || null
        ];
        
        console.log('Executing SQL:', sql);
        console.log('With values:', values);
        
        const [rows] = await connection.execute(sql, values);
        console.log('Insert result:', rows);
        
        // Return the inserted data with the new ID
        return {
            id: rows.insertId,
            ...data
        };
    }

    async update() {
        const sql = 'UPDATE personal_information SET full_name = ?, email = ?, phone = ?, avatar = ? WHERE id = ?';
        let values = [this.full_name, this.email, this.phone, this.avatar, this.id];
        values = values.map((value) => value === undefined ? null : value);
        const [rows, fields] = await connection.execute(sql, values);
        return this;
    }

    static async fetch() {
        let results = [];
        const sql = 'SELECT * FROM personal_information';
        const [rows] = await connection.query(sql)
        for (const row of rows) {
            const information = this.fill(row);
            console.log('information', information)
            results.push(information);
        }
        return results;
    }

    static async find(id) {
        const sql = 'SELECT * FROM personal_information WHERE id = ?';
        const [rows] = await connection.query(sql, [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return this.fill(row);
    }

    async delete () {
        const sql = 'DELETE FROM personal_information WHERE id = ?';
        const [rows] = await connection.query(sql, [this.id]);
        return rows.affectedRows > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM personal_information WHERE id = ?';
        const [rows] = await connection.query(sql, [id]);
        return rows.affectedRows > 0;
    }

    static async findByEmailAndPhone(email, phone) {
        const sql = 'SELECT * FROM personal_information WHERE email = ? AND phone = ?';
        const [rows] = await connection.query(sql, [email, phone]);
        return rows.length > 0 ? this.fill(rows[0]) : null;
    }

    static async count() {
        const sql = 'SELECT COUNT(*) AS count FROM personal_information';
        const [rows] = await connection.query(sql);
        return rows[0].count;
    }
}

module.exports = Information;