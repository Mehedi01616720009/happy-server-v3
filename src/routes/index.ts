import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { UpazilaRoutes } from '../modules/upazila/upazila.route';
import { UnionRoutes } from '../modules/union/union.route';
import { AreaRoutes } from '../modules/area/area.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { CompanyRoutes } from '../modules/company/company.route';
import { FreelancerRoutes } from '../modules/freelancer/freelancer.route';
import { RetailerRoutes } from '../modules/retailer/retailer.route';
import { DealerRoutes } from '../modules/dealer/dealer.route';
import { SrRoutes } from '../modules/sr/sr.route';
import { UserRouteRoutes } from '../modules/userRoute/userRoute.route';
import { DsrRoutes } from '../modules/dsr/dsr.route';
import { ProductRoutes } from '../modules/product/product.route';
import { OrderRoutes } from '../modules/order/order.route';
import { PickedProductRoutes } from '../modules/pickupMan/pickupMan.router';
import { CustomerCareDataRoutes } from '../modules/customerCare/customerCare.route';
import { DamageRoutes } from '../modules/damage/damage.route';
import { MediaRoutes } from '../modules/media/media.route';
import { TagRoutes } from '../modules/tag/tag.route';
import { WarehouseRoutes } from '../modules/warehouse/warehouse.route';

// route initialization
const router = Router();

// routes data
const routes = [
    // sort by module ascending
    {
        path: '/area',
        route: AreaRoutes,
    },
    {
        path: '/auth',
        route: AuthRoutes,
    },
    {
        path: '/categories',
        route: CategoryRoutes,
    },
    {
        path: '/companies',
        route: CompanyRoutes,
    },
    {
        path: '/customer-care-data',
        route: CustomerCareDataRoutes,
    },
    {
        path: '/damages',
        route: DamageRoutes,
    },
    {
        path: '/dealers',
        route: DealerRoutes,
    },
    {
        path: '/dsr',
        route: DsrRoutes,
    },
    {
        path: '/freelancers',
        route: FreelancerRoutes,
    },
    {
        path: '/media',
        route: MediaRoutes,
    },
    {
        path: '/orders',
        route: OrderRoutes,
    },
    {
        path: '/pickup-mans',
        route: PickedProductRoutes,
    },
    {
        path: '/products',
        route: ProductRoutes,
    },
    {
        path: '/retailers',
        route: RetailerRoutes,
    },
    {
        path: '/sr',
        route: SrRoutes,
    },
    {
        path: '/tags',
        route: TagRoutes,
    },
    {
        path: '/unions',
        route: UnionRoutes,
    },
    {
        path: '/upazilas',
        route: UpazilaRoutes,
    },
    {
        path: '/users',
        route: UserRoutes,
    },
    {
        path: '/user-routes',
        route: UserRouteRoutes,
    },
    {
        path: '/warehouses',
        route: WarehouseRoutes,
    },
];

// routes execution
routes.forEach(route => router.use(route.path, route.route));

export default router;
