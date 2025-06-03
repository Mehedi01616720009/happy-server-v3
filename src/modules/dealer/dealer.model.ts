import { model, Schema } from 'mongoose';
import { IDealer } from './dealer.interface';

// dealer schema
const dealerSchema = new Schema<IDealer>({
    dealer: {
        type: Schema.Types.ObjectId,
        required: [true, 'User ID is required'],
        ref: 'User',
        unique: true,
    },
    companies: {
        type: [Schema.Types.ObjectId],
        required: [true, 'Company is required'],
        ref: 'Company',
    },
});

// dealer model
export const Dealer = model<IDealer>('Dealer', dealerSchema);
