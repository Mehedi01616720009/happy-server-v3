const generateUserId = async (name: string, phone: string) => {
    const id =
        name.toLocaleLowerCase().split(' ').join('') + phone.substring(7);
    return id;
};

export default generateUserId;
