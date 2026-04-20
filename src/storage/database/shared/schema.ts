// @ts-nocheck
import { sql } from "drizzle-orm";
import {
    pgTable,
    varchar,
    timestamp,
    boolean,
    integer,
    jsonb,
    text,
    serial,
    index,
} from "drizzle-orm/pg-core";

// ==================== 用户表 ====================
export const users = pgTable(
    "users",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        email: varchar("email", { length: 255 }).notNull().unique(),
        password_hash: varchar("password_hash", { length: 255 }).notNull(),
        name: varchar("name", { length: 128 }).notNull(),
        phone: varchar("phone", { length: 20 }),
        role: varchar("role", { length: 20 }).notNull().default("adopter"),
        avatar_url: varchar("avatar_url", { length: 500 }),
        is_active: boolean("is_active").default(true).notNull(),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true }),
    },
    (table) => [index("users_email_idx").on(table.email), index("users_role_idx").on(table.role)]
);

// ==================== 验证码表 ====================
export const verificationCodes = pgTable(
    "verification_codes",
    {
        id: serial("id").primaryKey(),
        email: varchar("email", { length: 255 }).notNull(),
        code: varchar("code", { length: 10 }).notNull(),
        expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
        used: boolean("used").default(false),
        created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    },
    (table) => [index("verification_codes_email_idx").on(table.email)]
);

// ==================== 宠物表 ====================
export const pets = pgTable(
    "pets",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        shelter_id: varchar("shelter_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        name: varchar("name", { length: 100 }).notNull(),
        species: varchar("species", { length: 50 }).notNull(),
        breed: varchar("breed", { length: 100 }),
        age: integer("age").notNull(),
        gender: varchar("gender", { length: 10 }).notNull(),
        weight: varchar("weight", { length: 20 }),
        color: varchar("color", { length: 50 }),
        health_status: varchar("health_status", { length: 20 }).default("healthy"),
        vaccination_status: boolean("vaccination_status").default(false),
        neutered: boolean("neutered").default(false),
        description: text("description"),
        photos: jsonb("photos").default(sql`'[]'::jsonb`),
        status: varchar("status", { length: 20 }).notNull().default("available"),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true }),
    },
    (table) => [
        index("pets_shelter_id_idx").on(table.shelter_id),
        index("pets_status_idx").on(table.status),
        index("pets_species_idx").on(table.species),
    ]
);

// ==================== 宠物医疗记录表 ====================
export const pet_medical_records = pgTable(
    "pet_medical_records",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        pet_id: varchar("pet_id", { length: 36 })
            .notNull()
            .references(() => pets.id, { onDelete: "cascade" }),
        record_type: varchar("record_type", { length: 50 }).notNull(),
        title: varchar("title", { length: 200 }).notNull(),
        description: text("description"),
        record_date: timestamp("record_date", { withTimezone: true }).notNull(),
        vet_name: varchar("vet_name", { length: 100 }),
        vet_clinic: varchar("vet_clinic", { length: 200 }),
        next_date: timestamp("next_date", { withTimezone: true }),
        documents: jsonb("documents").default(sql`'[]'::jsonb`),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("pet_medical_records_pet_id_idx").on(table.pet_id),
        index("pet_medical_records_date_idx").on(table.record_date),
    ]
);

// ==================== 互动计划表 ====================
export const interaction_plans = pgTable(
    "interaction_plans",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        pet_id: varchar("pet_id", { length: 36 })
            .notNull()
            .references(() => pets.id, { onDelete: "cascade" }),
        title: varchar("title", { length: 200 }).notNull(),
        description: text("description"),
        target_count: integer("target_count").notNull().default(3),
        tasks: jsonb("tasks").default(sql`'[]'::jsonb`),
        status: varchar("status", { length: 20 }).notNull().default("active"),
        start_date: timestamp("start_date", { withTimezone: true }),
        end_date: timestamp("end_date", { withTimezone: true }),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true }),
    },
    (table) => [
        index("interaction_plans_pet_id_idx").on(table.pet_id),
        index("interaction_plans_status_idx").on(table.status),
    ]
);

// ==================== 互动打卡表 ====================
export const checkins = pgTable(
    "checkins",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        plan_id: varchar("plan_id", { length: 36 })
            .notNull()
            .references(() => interaction_plans.id, { onDelete: "cascade" }),
        adopter_id: varchar("adopter_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        pet_id: varchar("pet_id", { length: 36 })
            .notNull()
            .references(() => pets.id),
        task_index: integer("task_index").notNull(),
        media_url: varchar("media_url", { length: 500 }),
        note: text("note"),
        trust_score: integer("trust_score").default(0),
        location: varchar("location", { length: 200 }),
        checkin_time: timestamp("checkin_time", { withTimezone: true }).notNull(),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("checkins_plan_id_idx").on(table.plan_id),
        index("checkins_adopter_id_idx").on(table.adopter_id),
        index("checkins_pet_id_idx").on(table.pet_id),
        index("checkins_time_idx").on(table.checkin_time),
    ]
);

// ==================== 领养合同表 ====================
export const contracts = pgTable(
    "contracts",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        pet_id: varchar("pet_id", { length: 36 })
            .notNull()
            .references(() => pets.id),
        adopter_id: varchar("adopter_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        shelter_id: varchar("shelter_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        terms: text("terms"),
        adopter_signature: varchar("adopter_signature", { length: 200 }),
        shelter_signature: varchar("shelter_signature", { length: 200 }),
        adopter_signed_at: timestamp("adopter_signed_at", { withTimezone: true }),
        shelter_signed_at: timestamp("shelter_signed_at", { withTimezone: true }),
        status: varchar("status", { length: 20 }).notNull().default("pending"),
        adopted_at: timestamp("adopted_at", { withTimezone: true }),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true }),
    },
    (table) => [
        index("contracts_pet_id_idx").on(table.pet_id),
        index("contracts_adopter_id_idx").on(table.adopter_id),
        index("contracts_shelter_id_idx").on(table.shelter_id),
        index("contracts_status_idx").on(table.status),
    ]
);

// ==================== 回访任务表 ====================
export const followup_tasks = pgTable(
    "followup_tasks",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        contract_id: varchar("contract_id", { length: 36 })
            .notNull()
            .references(() => contracts.id, { onDelete: "cascade" }),
        pet_id: varchar("pet_id", { length: 36 })
            .notNull()
            .references(() => pets.id),
        adopter_id: varchar("adopter_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        title: varchar("title", { length: 200 }).notNull(),
        description: text("description"),
        requirements: jsonb("requirements").default(sql`'[]'::jsonb`),
        due_date: timestamp("due_date", { withTimezone: true }).notNull(),
        status: varchar("status", { length: 20 }).notNull().default("pending"),
        submitted_at: timestamp("submitted_at", { withTimezone: true }),
        approved_at: timestamp("approved_at", { withTimezone: true }),
        approved_by: varchar("approved_by", { length: 36 }).references(() => users.id),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updated_at: timestamp("updated_at", { withTimezone: true }),
    },
    (table) => [
        index("followup_tasks_contract_id_idx").on(table.contract_id),
        index("followup_tasks_pet_id_idx").on(table.pet_id),
        index("followup_tasks_adopter_id_idx").on(table.adopter_id),
        index("followup_tasks_status_idx").on(table.status),
        index("followup_tasks_due_date_idx").on(table.due_date),
    ]
);

// ==================== 回访反馈表 ====================
export const followup_feedbacks = pgTable(
    "followup_feedbacks",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        task_id: varchar("task_id", { length: 36 })
            .notNull()
            .references(() => followup_tasks.id, { onDelete: "cascade" }),
        media_urls: jsonb("media_urls").default(sql`'[]'::jsonb`),
        responses: jsonb("responses").default(sql`'{}'::jsonb`),
        health_status: varchar("health_status", { length: 20 }),
        ai_analysis: jsonb("ai_analysis"),
        notes: text("notes"),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [index("followup_feedbacks_task_id_idx").on(table.task_id)]
);

// ==================== AI 分析记录表 ====================
export const ai_analysis_records = pgTable(
    "ai_analysis_records",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        pet_id: varchar("pet_id", { length: 36 }).references(() => pets.id),
        feedback_id: varchar("feedback_id", { length: 36 }).references(() => followup_feedbacks.id),
        analysis_type: varchar("analysis_type", { length: 50 }).notNull(),
        image_url: varchar("image_url", { length: 500 }).notNull(),
        result: jsonb("result"),
        score: integer("score"),
        warnings: jsonb("warnings").default(sql`'[]'::jsonb`),
        recommendations: jsonb("recommendations").default(sql`'[]'::jsonb`),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("ai_analysis_records_pet_id_idx").on(table.pet_id),
        index("ai_analysis_records_feedback_id_idx").on(table.feedback_id),
        index("ai_analysis_records_type_idx").on(table.analysis_type),
    ]
);

// ==================== 收藏表 ====================
export const favorites = pgTable(
    "favorites",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        user_id: varchar("user_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        pet_id: varchar("pet_id", { length: 36 })
            .notNull()
            .references(() => pets.id),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("favorites_user_id_idx").on(table.user_id),
        index("favorites_pet_id_idx").on(table.pet_id),
    ]
);

// ==================== 消息表 ====================
export const messages = pgTable(
    "messages",
    {
        id: varchar("id", { length: 36 })
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        sender_id: varchar("sender_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        receiver_id: varchar("receiver_id", { length: 36 })
            .notNull()
            .references(() => users.id),
        pet_id: varchar("pet_id", { length: 36 }).references(() => pets.id),
        content: text("content").notNull(),
        is_read: boolean("is_read").default(false),
        created_at: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("messages_sender_id_idx").on(table.sender_id),
        index("messages_receiver_id_idx").on(table.receiver_id),
        index("messages_pet_id_idx").on(table.pet_id),
    ]
);