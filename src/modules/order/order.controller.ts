import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { OrderServices } from './order.service';

// create order controller
const createOrder = catchAsync(async (req, res) => {
    const result = await OrderServices.createOrderIntoDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Order has been created successfully',
        data: result,
    });
});

// get all order controller
const getAllOrder = catchAsync(async (req, res) => {
    const result = await OrderServices.getAllOrderFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Order have been retrieved successfully',
        data: result,
    });
});

// get all order details controller
const getAllOrderDetails = catchAsync(async (req, res) => {
    const result = await OrderServices.getAllOrderDetailsFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'All Order have been retrieved successfully',
        data: result,
    });
});

// get single order controller
const getSingleOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OrderServices.getSingleOrderFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order has been retrieved successfully',
        data: result,
    });
});

// update order product controller
const updateOrderProduct = catchAsync(async (req, res) => {
    const { id, productId } = req.params;
    const result = await OrderServices.updateOrderProductIntoDB(
        id,
        productId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order Product has been updated successfully',
        data: result,
    });
});

// cancel order product controller
const cancelOrderProduct = catchAsync(async (req, res) => {
    const { id, productId } = req.params;
    const result = await OrderServices.cancelOrderProductIntoDB(
        id,
        productId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order Product has been cancelled successfully',
        data: result,
    });
});

// dispatch order controller
const dispatchOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OrderServices.dispatchOrderIntoDB(
        id,
        req.body,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order has been dispatched successfully',
        data: result,
    });
});

// update order product by deliveryman controller
const updateOrderProductByDeliveryman = catchAsync(async (req, res) => {
    const { id, productId } = req.params;
    const result = await OrderServices.updateOrderProductByDeliverymanIntoDB(
        id,
        productId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order Product has been updated successfully',
        data: result,
    });
});

// update order product by sr controller
const updateOrderProductBySr = catchAsync(async (req, res) => {
    const { id, productId } = req.params;
    const result = await OrderServices.updateOrderProductBySrIntoDB(
        id,
        productId,
        req.body
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order Product has been updated successfully',
        data: result,
    });
});

// cancel order controller
const cancelOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OrderServices.cancelOrderIntoDB(
        id,
        req.body,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order has been cancelled successfully',
        data: result,
    });
});

// deliver order controller
const deliverOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OrderServices.deliverOrderIntoDB(
        id,
        req.body,
        req.user
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order has been delivered successfully',
        data: result,
    });
});

// get order inventory controller
const getOrderInventory = catchAsync(async (req, res) => {
    const result = await OrderServices.getOrderInventoryFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Inventory data has been retrieved successfully',
        data: result,
    });
});

// get order inventory details controller
const getOrderInventoryDetails = catchAsync(async (req, res) => {
    const result = await OrderServices.getOrderInventoryDetailsFromDB(
        req.query
    );
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Inventory Details have been retrieved successfully',
        data: result,
    });
});

// get order summary controller
const getOrderSummary = catchAsync(async (req, res) => {
    const result = await OrderServices.getOrderSummaryFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order Summary has been retrieved successfully',
        data: result,
    });
});

// get order history controller
const getOrderHistory = catchAsync(async (req, res) => {
    const result = await OrderServices.getOrderHistoryFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order History has been retrieved successfully',
        data: result,
    });
});

// get order counting controller
const getOrderCounting = catchAsync(async (req, res) => {
    const result = await OrderServices.getOrderCountingFromDB(req.query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order Counting has been retrieved successfully',
        data: result,
    });
});

// delete order controller
const deleteOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await OrderServices.deleteOrderFromDB(id);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order has been deleted successfully',
        data: result,
    });
});

// delete many order controller
const deleteManyOrder = catchAsync(async (req, res) => {
    const result = await OrderServices.deleteManyOrderFromDB(req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Order has been deleted successfully',
        data: result,
    });
});

export const OrderController = {
    createOrder,
    getAllOrder,
    getAllOrderDetails,
    getSingleOrder,
    updateOrderProduct,
    cancelOrderProduct,
    dispatchOrder,
    cancelOrder,
    updateOrderProductByDeliveryman,
    updateOrderProductBySr,
    deliverOrder,
    getOrderInventory,
    getOrderInventoryDetails,
    getOrderSummary,
    getOrderHistory,
    getOrderCounting,
    deleteOrder,
    deleteManyOrder,
};
