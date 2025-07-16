import { IRetailer } from '../modules/retailer/retailer.interface';

const findNearDistanceRetailer = async (
    payload: IRetailer[],
    centerLat: number,
    centerLon: number
) => {
    // Earth's radius in meters
    const EARTH_RADIUS = 6371000;
    const RADIUS_LIMIT = 100; // 50 meters

    return payload.filter(user => {
        // Convert degrees to radians
        const lat1 = (centerLat * Math.PI) / 180;
        const lon1 = (centerLon * Math.PI) / 180;
        const lat2 = (user.location.latitude * Math.PI) / 180;
        const lon2 = (user.location.longitude * Math.PI) / 180;

        // Haversine formula
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) *
                Math.cos(lat2) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = EARTH_RADIUS * c;

        return distance <= RADIUS_LIMIT;
    });
};

export default findNearDistanceRetailer;
