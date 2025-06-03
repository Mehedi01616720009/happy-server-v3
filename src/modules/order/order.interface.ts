import { Types } from 'mongoose';
import { ILocation } from '../retailer/retailer.interface';

type TOrderStatus =
    | 'Pending'
    | 'Baki'
    | 'Customer Care'
    | 'Processing'
    | 'Dispatched'
    | 'Delivered'
    | 'Cancelled';

// order interface
export interface IOrder {
    id: string;
    retailer: Types.ObjectId;
    area: Types.ObjectId;
    dealer: Types.ObjectId;
    sr?: Types.ObjectId;
    dsr?: Types.ObjectId;
    packingman?: Types.ObjectId;
    basket?: string;
    status: TOrderStatus;
    paymentStatus: 'Paid' | 'Unpaid' | 'Partial Paid';
    collectionAmount: number;
    collectedAmount: number;
    location?: ILocation;
    createdAt: string;
    updatedAt: string;
    insertedDate: Date;
    deliveredTime?: string;
    cancelledTime?: string;
    cancelledReason?: string;
}

// order details product interface
export interface IOrderDetailsProduct {
    product: Types.ObjectId;
    quantity: number;
    price: number;
    totalAmount: number;
    dealerPrice?: number;
    dealerTotalAmount?: number;
    srPrice?: number;
    srTotalAmount?: number;
    inventory?: {
        out?: number;
        sale?: number;
        in?: number;
    };
    isEdited?: {
        isEdited?: boolean;
        previousQuantity?: number;
    };
    isCancelled?: {
        isCancelled?: boolean;
        cancelledTime?: string;
        cancelledReason?: string;
    };
}

// order details interface
export interface IOrderDetails {
    order: Types.ObjectId;
    products: IOrderDetailsProduct[];
}

// create order interface
export interface ICreateOrder {
    id: string;
    retailer: Types.ObjectId;
    area: Types.ObjectId;
    dealer: Types.ObjectId;
    sr?: Types.ObjectId;
    dsr?: Types.ObjectId;
    status?: 'Baki' | 'Delivered';
    paymentStatus?: 'Paid' | 'Unpaid' | 'Partial Paid';
    collectionAmount: number;
    collectedAmount?: number;
    requestDate?: string;
    location?: ILocation;
    products: Array<
        Pick<
            IOrderDetailsProduct,
            | 'product'
            | 'quantity'
            | 'price'
            | 'totalAmount'
            | 'srPrice'
            | 'srTotalAmount'
        > & { quantityPerPackage: number }
    >;
}
