const generateOrderId = async (data: string[]) => {
    const id = data.join('-') + '-' + new Date().getTime();
    return id;
};

export default generateOrderId;
