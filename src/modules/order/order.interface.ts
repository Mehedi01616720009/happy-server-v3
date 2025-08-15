import { Types } from 'mongoose';

type TOrderStatus =
    | 'Pending'
    | 'Baki'
    | 'Processing'
    | 'Dispatched'
    | 'Delivered'
    | 'Cancelled';

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
    summary?: {
        orderedQuantity?: number;
        packedQuantity?: number;
        soldQuantity?: number;
    };
    isCancelled?: {
        isCancelled?: boolean;
        cancelledTime?: string;
        cancelledReason?: string;
    };
}

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
    products: IOrderDetailsProduct[];
    createdAt: string;
    updatedAt: string;
    insertedDate: Date;
    deliveredTime?: string;
    cancelledTime?: string;
    cancelledReason?: string;
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
    products: Array<
        Pick<
            IOrderDetailsProduct,
            | 'product'
            | 'quantity'
            | 'price'
            | 'totalAmount'
            | 'srPrice'
            | 'srTotalAmount'
        >
    >;
}
