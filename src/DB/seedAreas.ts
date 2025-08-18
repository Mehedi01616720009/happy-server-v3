import path from 'path';
import fs from 'fs';
import { Area } from '../modules/area/area.model';

export const seedUpazilas = async () => {
    try {
        // Read the JSON files
        const areaFilePath = path.join('data', 'area.json');
        const areas = JSON.parse(fs.readFileSync(areaFilePath, 'utf-8'));

        const totalAreas = await Area.countDocuments();
        if (totalAreas === 0) {
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

            const cleanedData = areas.map((doc: any) => transformObjectId(doc));

            // Insert the areas
            await Area.insertMany(cleanedData);
        }
    } catch (error) {
        console.log({ message: `Error seeding area data: ${error}` });
    }
};
