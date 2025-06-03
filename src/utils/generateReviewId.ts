const generateReviewId = async () => {
    const id = new Date().getTime();
    return id;
};

export default generateReviewId;
