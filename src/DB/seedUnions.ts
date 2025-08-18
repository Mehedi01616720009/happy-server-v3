import path from 'path';
import fs from 'fs';
import { Union } from '../modules/union/union.model';
import { Upazila } from '../modules/upazila/upazila.model';

export const seedUnions = async () => {
    try {
        // Read the JSON files
        const unionFilePath = path.join('data', 'union.json');
        const unions = JSON.parse(fs.readFileSync(unionFilePath, 'utf-8'));

        const totalUnions = await Union.countDocuments();
        if (totalUnions === 0) {
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

            const cleanedData = unions.map((doc: any) =>
                transformObjectId(doc)
            );

            // Insert the unions
            await Union.insertMany(cleanedData);
        }
    } catch (error) {
        console.log({ message: `Error seeding union data: ${error}` });
    }
};
