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
            await Union.insertMany(unions);
        }

        // Map and insert unions
        // for (const union of unions) {
        //     const upazilaID = await Upazila.findOne({
        //         name: union.upazilla_id,
        //     });

        //     const unionData = {
        //         id: union.name,
        //         upazila: upazilaID,
        //         name: union.name,
        //         bnName: union.bn_name,
        //     };

        //     // Upsert the union
        //     await Union.updateOne(
        //         { id: unionData.id },
        //         { $set: unionData },
        //         { upsert: true }
        //     );
        // }
    } catch (error) {
        console.log({ message: `Error seeding union data: ${error}` });
    }
};
