import path from 'path';
import fs from 'fs';
import { Upazila } from '../modules/upazila/upazila.model';

export const seedUpazilas = async () => {
    try {
        // Read the JSON files
        const upazilaFilePath = path.join('data', 'upazila.json');
        const upazilas = JSON.parse(fs.readFileSync(upazilaFilePath, 'utf-8'));

        const totalUpazilas = await Upazila.countDocuments();
        if (totalUpazilas === 0) {
            await Upazila.insertMany(upazilas);
        }

        // Map and insert upazilas
        // for (const upazila of upazilas) {
        //     const districtName = 'Rajshahi';

        //     const upazilaData = {
        //         id: upazila.name,
        //         district: districtName,
        //         name: upazila.name,
        //         bnName: upazila.bn_name,
        //     };

        //     // Upsert the upazila
        //     await Upazila.updateOne(
        //         { id: upazilaData.id },
        //         { $set: upazilaData },
        //         { upsert: true }
        //     );
        // }
    } catch (error) {
        console.log({ message: `Error seeding upazila data: ${error}` });
    }
};
