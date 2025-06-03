const generatePhone = async () => {
    const phone = Math.round(Math.random() * 9999999999);
    return String(phone);
};

export default generatePhone;
