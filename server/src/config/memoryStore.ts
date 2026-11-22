import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// In-memory collections
export const memoryCollections = {
  users: [] as any[],
  complaints: [] as any[],
  auditLogs: [] as any[],
};

export const memoryStore = {
  clearAll() {
    memoryCollections.users = [];
    memoryCollections.complaints = [];
    memoryCollections.auditLogs = [];
  },

  // USERS
  users: {
    async create(docData: any) {
      const _id = docData._id || new mongoose.Types.ObjectId();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(docData.password, salt);

      const record: any = {
        ...docData,
        _id,
        password: hashedPassword,
        isActive: docData.isActive !== undefined ? docData.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
        async comparePassword(candidate: string) {
          return bcrypt.compare(candidate, this.password);
        },
        async save() {
          this.updatedAt = new Date();
          const idx = memoryCollections.users.findIndex((u) => u._id.toString() === this._id.toString());
          if (idx !== -1) memoryCollections.users[idx] = this;
          return this;
        },
        toObject() {
          const { ...rest } = this;
          return rest;
        },
      };

      memoryCollections.users.push(record);
      return record;
    },

    findOne(query: any) {
      const findRecord = () => {
        return memoryCollections.users.find((u) => {
          if (query.email) return u.email?.toLowerCase() === query.email?.toLowerCase();
          if (query._id) return u._id.toString() === query._id.toString();
          if (query.role) return u.role === query.role;
          return true;
        }) || null;
      };

      const result = findRecord();
      return {
        select: (_fields?: string) => Promise.resolve(result),
        then: (resolve: any, reject?: any) => Promise.resolve(result).then(resolve, reject),
      };
    },

    findById(id: any) {
      const found = memoryCollections.users.find((u) => u._id.toString() === id.toString()) || null;
      return {
        select: (_fields?: string) => Promise.resolve(found),
        then: (resolve: any, reject?: any) => Promise.resolve(found).then(resolve, reject),
      };
    },

    find(query: any = {}) {
      let filtered = [...memoryCollections.users];
      if (query.role) filtered = filtered.filter((u) => u.role === query.role);
      if (query.isActive !== undefined) filtered = filtered.filter((u) => u.isActive === query.isActive);

      return {
        select: (_fields?: string) => ({
          sort: () => Promise.resolve(filtered),
          then: (resolve: any, reject?: any) => Promise.resolve(filtered).then(resolve, reject),
        }),
        sort: () => Promise.resolve(filtered),
        then: (resolve: any, reject?: any) => Promise.resolve(filtered).then(resolve, reject),
      };
    },

    async countDocuments(query: any = {}) {
      let res = [...memoryCollections.users];
      if (query.role) res = res.filter((u) => u.role === query.role);
      if (query.isActive !== undefined) res = res.filter((u) => u.isActive === query.isActive);
      return res.length;
    },
  },

  // COMPLAINTS
  complaints: {
    async create(docData: any) {
      const _id = docData._id || new mongoose.Types.ObjectId();
      const record: any = {
        ...docData,
        _id,
        createdAt: docData.createdAt || new Date(),
        updatedAt: docData.updatedAt || new Date(),
        timeline: docData.timeline || [],
        async save() {
          this.updatedAt = new Date();
          const idx = memoryCollections.complaints.findIndex((c) => c._id.toString() === this._id.toString());
          if (idx !== -1) memoryCollections.complaints[idx] = this;
          return this;
        },
        toObject() {
          return { ...this };
        },
      };
      memoryCollections.complaints.push(record);
      return record;
    },

    async insertMany(docs: any[]) {
      for (const d of docs) {
        await this.create(d);
      }
      return docs;
    },

    find(query: any = {}, _projection?: any) {
      const filterFn = (item: any) => {
        if (query.citizen && item.citizen?.toString() !== query.citizen?.toString()) return false;
        if (query.assignedWorker && item.assignedWorker?.toString() !== query.assignedWorker?.toString()) return false;
        if (query.status && item.status !== query.status) return false;
        if (query.priority && item.priority !== query.priority) return false;
        if (query.wasteCategory && item.wasteCategory !== query.wasteCategory) return false;
        if (query['location.ward'] && item.location?.ward !== query['location.ward']) return false;
        if (query.$or) {
          const matchAny = query.$or.some((clause: any) => {
            if (clause.trackingId) return clause.trackingId.test(item.trackingId);
            if (clause.title) return clause.title.test(item.title);
            if (clause['location.address']) return clause['location.address'].test(item.location?.address);
            if (clause.citizenName) return clause.citizenName.test(item.citizenName);
            return false;
          });
          if (!matchAny) return false;
        }
        return true;
      };

      const filtered = memoryCollections.complaints.filter(filterFn);

      const chainable = {
        sort: () => chainable,
        skip: (skipNum: number) => ({
          limit: (limitNum: number) => ({
            populate: () => ({
              populate: () => Promise.resolve(filtered.slice(skipNum, skipNum + limitNum)),
            }),
            then: (resolve: any, reject?: any) =>
              Promise.resolve(filtered.slice(skipNum, skipNum + limitNum)).then(resolve, reject),
          }),
        }),
        limit: (limitNum: number) => ({
          then: (resolve: any, reject?: any) => Promise.resolve(filtered.slice(0, limitNum)).then(resolve, reject),
        }),
        populate: () => ({
          populate: () => Promise.resolve(filtered),
        }),
        lean: () => Promise.resolve(filtered),
        then: (resolve: any, reject?: any) => Promise.resolve(filtered).then(resolve, reject),
      };

      return chainable;
    },

    findById(id: any) {
      const found = memoryCollections.complaints.find((c) => c._id.toString() === id.toString()) || null;
      return {
        populate: () => ({
          populate: () => Promise.resolve(found),
          then: (resolve: any, reject?: any) => Promise.resolve(found).then(resolve, reject),
        }),
        then: (resolve: any, reject?: any) => Promise.resolve(found).then(resolve, reject),
      };
    },

    findOne(query: any) {
      const found =
        memoryCollections.complaints.find((c) => {
          if (query.trackingId) return c.trackingId?.toUpperCase() === query.trackingId?.toUpperCase();
          if (query._id) return c._id.toString() === query._id.toString();
          return true;
        }) || null;

      return {
        select: () => Promise.resolve(found),
        then: (resolve: any, reject?: any) => Promise.resolve(found).then(resolve, reject),
      };
    },

    async countDocuments(query: any = {}) {
      if (Object.keys(query).length === 0) return memoryCollections.complaints.length;
      return memoryCollections.complaints.filter((c) => {
        if (query.citizen && c.citizen?.toString() !== query.citizen?.toString()) return false;
        if (query.assignedWorker && c.assignedWorker?.toString() !== query.assignedWorker?.toString()) return false;
        if (query.status) {
          if (typeof query.status === 'object' && query.status.$in) {
            return query.status.$in.includes(c.status);
          }
          return c.status === query.status;
        }
        return true;
      }).length;
    },

    async aggregate(pipeline: any[]) {
      const groupStage = pipeline.find((p) => p.$group);
      if (!groupStage) return [];

      const groupField = groupStage.$group._id;
      const counts: Record<string, number> = {};
      const extraNames: Record<string, string> = {};

      memoryCollections.complaints.forEach((c) => {
        let key = 'Other';
        if (groupField === '$wasteCategory') key = c.wasteCategory;
        else if (groupField === '$location.ward') key = c.location?.ward || 'General Ward';
        else if (groupField === '$priority') key = c.priority;

        counts[key] = (counts[key] || 0) + 1;
        if (c.wasteCategoryName) extraNames[key] = c.wasteCategoryName;
      });

      return Object.entries(counts).map(([id, count]) => ({
        _id: id,
        count,
        name: extraNames[id] || id,
      }));
    },
  },

  // AUDIT LOGS
  auditLogs: {
    async create(docData: any) {
      const record = {
        ...docData,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
      };
      memoryCollections.auditLogs.push(record);
      return record;
    },
  },
};
