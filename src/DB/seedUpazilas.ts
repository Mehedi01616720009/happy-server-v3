import path from 'path';
import fs from 'fs';
import { Upazila } from '../modules/upazila/upazila.model';
import { Types } from 'mongoose';

export const seedUpazilas = async () => {
    try {
        // Read the JSON files
        const upazilaFilePath = path.join('data', 'upazila.json');
        const upazilas = JSON.parse(fs.readFileSync(upazilaFilePath, 'utf-8'));

        const totalUpazilas = await Upazila.countDocuments();
        if (totalUpazilas === 0) {
            const transformObjectId = (obj: any) => {
                for (const key in obj) {
                    if (typeof obj[key] === 'object' && obj[key]?.$oid) {
                        obj[key] = obj[key].$oid;
                    } else if (typeof obj[key] === 'object') {
                        transformObjectId(obj[key]);
                    }
                }
                return obj;
            };

            const cleanedData = upazilas.map((doc: any) =>
                transformObjectId(doc)
            );

            // Insert the upazilas
            await Upazila.insertMany(cleanedData);
        }
    } catch (error) {
        console.log({ message: `Error seeding upazila data: ${error}` });
    }
};
