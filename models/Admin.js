const connection = require('./Connection');
class Admin {

    static fill(obj = {}) {
        console.log('obj', obj)
        const data = new Admin()
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
        const sql = 'INSERT INTO admin (full_name, email, password, avatar) VALUES (?, ?, ?, ?)';
        const values = [
            data.full_name || null,
            data.email || null,
            data.password || null,
            data.avatar || null
        ];
        
        console.log('Executing SQL:', sql);
        console.log('With values:', values);
        console.log("Insert method received password:", data.password);
        
        const [rows] = await connection.execute(sql, values);
        console.log('Insert result:', rows);
        
        // Return the inserted data with the new ID
        return {
            id: rows.insertId,
            ...data
        };
    }

    async update() {
        const sql = 'UPDATE admin SET full_name = ?, email = ?, password = ?, avatar = ? WHERE id = ?';
        let values = [this.full_name, this.email, this.password, this.avatar, this.id];
        values = values.map((value) => value === undefined ? null : value);
        const [rows, fields] = await connection.execute(sql, values);
        return this;
    }

    static async fetch() {
        let results = [];
        const sql = 'SELECT * FROM admin';
        const [rows] = await connection.query(sql)
        for (const row of rows) {
            const information = this.fill(row);
            console.log('information', information)
            results.push(information);
        }
        return results;
    }

    static async find(id) {
        const sql = 'SELECT * FROM admin WHERE id = ?';
        const [rows] = await connection.query(sql, [id]);
        if (rows.length === 0) {
            return null;
        }
        const row = rows[0];
        return this.fill(row);
    }

    async delete () {
        const sql = 'DELETE FROM admin WHERE id = ?';
        const [rows] = await connection.query(sql, [this.id]);
        return rows.affectedRows > 0;
    }

    static async delete(id) {
        const sql = 'DELETE FROM admin WHERE id = ?';
        const [rows] = await connection.query(sql, [id]);
        return rows.affectedRows > 0;
    }

    static async findByEmailAndPassword(email, password) {
    const sql = 'SELECT * FROM admin WHERE email = ? AND password = ?';
    const [rows] = await connection.query(sql, [email, password]);
    return rows.length > 0 ? this.fill(rows[0]) : null;
    }

    static async findByEmail(email) {
        const sql = "SELECT * FROM admin WHERE email = ?";
        const [rows] = await connection.query(sql, [email]);
        if (rows.length === 0) {
            return null;
        }
        return this.fill(rows[0]);
    }
}

module.exports = Admin;