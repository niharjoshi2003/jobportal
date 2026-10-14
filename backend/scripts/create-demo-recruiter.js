import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { User } from '../models/user.model.js';
import { Company } from '../models/company.model.js';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

try {
    if (!process.env.MONGO_URI) throw new Error('Missing database configuration');
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    const email = 'demo.recruiter@jobohire.com';
    if (await User.exists({ email })) {
        console.log('The demo email already exists. No account or password was changed.');
        process.exitCode = 1;
    } else {
        const password = `Demo!${crypto.randomBytes(12).toString('base64url')}`;
        const user = await User.create({
            fullname: 'Demo Recruiter', email, phoneNumber: 9999999999,
            password: await bcrypt.hash(password, 12), role: 'recruiter', status: 'approved',
        });
        console.log(`Demo recruiter created.\nEmail: ${email}\nPassword: ${password}`);
        const linkedCompanies = await Company.countDocuments({ userId: user._id });
        console.log(`Linked companies: ${linkedCompanies}. No company or vacancy was created.`);
    }
} catch (error) {
    // Connection errors can contain credentials; never print the connection string.
    console.error(`Demo setup failed (${error.code || error.name}). Check MONGO_URI and database connectivity.`);
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
