import moment from 'moment-timezone';
import { FilterQuery, Query } from 'mongoose';
import { TIMEZONE } from '../constant';

class QueryBuilder<T> {
    constructor(
        public modelQuery: Query<T[], T>,
        public query: Record<string, unknown>
    ) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    // searchable query
    search(searchableFields: string[]) {
        const searchTerm = this?.query?.searchTerm;
        if (searchTerm) {
            this.modelQuery = this.modelQuery.find({
                $or: searchableFields.map(
                    field =>
                        ({
                            [field]: { $regex: searchTerm, $options: 'i' },
                        } as FilterQuery<T>)
                ),
            });
        }

        return this;
    }

    // filter query
    filter() {
        const queryObj = { ...this?.query };
        const excludeTerms = ['searchTerm', 'sort', 'page', 'limit', 'fields'];
        excludeTerms.forEach(term => delete queryObj[term]);

        const advancedFilters: Record<string, unknown> = {};

        Object.keys(queryObj).forEach(key => {
            if (key === 'createdAt' && typeof queryObj[key] === 'object') {
                const dateFilters = queryObj[key] as Record<string, string>;
                const matchConditions: Record<string, unknown> = {};

                if (dateFilters.gte || dateFilters.gt) {
                    const startOfDay = moment
                        .tz(dateFilters.gte || dateFilters.gt, TIMEZONE)
                        .startOf('day')
                        .format();
                    matchConditions.$gte = startOfDay;
                }

                if (dateFilters.lte || dateFilters.lt) {
                    const endOfDay = moment
                        .tz(dateFilters.lte || dateFilters.lt, TIMEZONE)
                        .endOf('day')
                        .format();
                    matchConditions.$lte = endOfDay;
                }

                advancedFilters[key] = matchConditions;
            } else if (
                key === 'updatedAt' &&
                typeof queryObj[key] === 'object'
            ) {
                const dateFilters = queryObj[key] as Record<string, string>;
                const matchConditions: Record<string, unknown> = {};

                if (dateFilters.gte || dateFilters.gt) {
                    const startOfDay = moment
                        .tz(dateFilters.gte || dateFilters.gt, TIMEZONE)
                        .startOf('day')
                        .format();
                    matchConditions.$gte = startOfDay;
                }

                if (dateFilters.lte || dateFilters.lt) {
                    const endOfDay = moment
                        .tz(dateFilters.lte || dateFilters.lt, TIMEZONE)
                        .endOf('day')
                        .format();
                    matchConditions.$lte = endOfDay;
                }

                advancedFilters[key] = matchConditions;
            } else if (Array.isArray(queryObj[key])) {
                advancedFilters[key] = { $in: queryObj[key] };
            } else if (
                typeof queryObj[key] === 'object' &&
                queryObj[key] !== null &&
                ('$gte' in queryObj[key] || '$lte' in queryObj[key])
            ) {
                advancedFilters[key] = queryObj[key];
            } else {
                advancedFilters[key] = queryObj[key];
            }
        });

        this.modelQuery = this.modelQuery.find(
            advancedFilters as FilterQuery<T>
        );
        return this;
    }

    // sorting
    sort() {
        const sort = (this?.query?.sort as string)
            ? (this?.query?.sort as string).split(',').join(' ')
            : '-insertedDate';
        this.modelQuery = this.modelQuery.sort(sort as string);
        return this;
    }

    // paginate
    paginate() {
        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 10;
        const skip = (page - 1) * limit || 0;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    // filter fields projection
    fields() {
        const fields = (this?.query?.fields as string)
            ? (this?.query?.fields as string).split(',').join(' ')
            : '-__v';
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }

    async countTotal() {
        const queries = this.modelQuery.getFilter();
        const totalDoc = await this.modelQuery.model.countDocuments(queries);

        const page = Number(this?.query?.page) || 1;
        const limit = Number(this?.query?.limit) || 10;
        const totalPageCount = Math.ceil(totalDoc / limit);
        const totalPage = totalPageCount !== 0 ? totalPageCount : 1;

        return {
            page,
            limit,
            totalPage,
            totalDoc,
        };
    }
}

export default QueryBuilder;
