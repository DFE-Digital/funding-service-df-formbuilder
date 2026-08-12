import { DetailItem } from "../types";
import { format } from "date-fns";
import { ComponentTypeEnum } from "@xgovformbuilder/model";
import { debugConsoleLog } from "src/server/utils/commonUtils";

function formatRawDateTime(raw) {
    // Extract keys without knowing the prefix
    const keys = Object.keys(raw);

    const dayKey = keys.find((k) => k.endsWith("__day"));
    const monthKey = keys.find((k) => k.endsWith("__month"));
    const yearKey = keys.find((k) => k.endsWith("__year"));
    const hourKey = keys.find((k) => k.endsWith("__hour"));
    const minuteKey = keys.find((k) => k.endsWith("__minute"));
    const ampmKey = keys.find((k) => k.endsWith("__ampm"));

    const day = dayKey ? raw[dayKey] : undefined;
    const month = monthKey ? raw[monthKey] : undefined;
    const year = yearKey ? raw[yearKey] : undefined;
    const hour = hourKey ? raw[hourKey] : undefined;
    const minute = minuteKey ? raw[minuteKey] : undefined;
    const ampm = ampmKey ? raw[ampmKey] : undefined;

    const parts: string[] = [];

    // --- Build date ---
    if (year !== undefined) {
        const mm = month !== undefined ? String(month).padStart(2, "0") : "";
        const dd = day !== undefined ? String(day).padStart(2, "0") : "";

        if (month !== undefined && day !== undefined) {
            parts.push(`${year}-${mm}-${dd}`); // full YYYY-MM-DD
        } else if (month !== undefined) {
            parts.push(`${year}-${mm}`); // YYYY-MM
        } else {
            parts.push(String(year)); // just YYYY
        }
    } else if (month !== undefined) {
        const mm = String(month).padStart(2, "0");
        if (day !== undefined) {
            const dd = String(day).padStart(2, "0");
            parts.push(`${mm}-${dd}`); // MM-DD without year
        } else {
            parts.push(`${mm}`); // just MM
        }
    } else if (day !== undefined) {
        const dd = String(day).padStart(2, "0");
        parts.push(`${dd}`); // just DD
    }

    // --- Build time ---
    if (hour !== undefined && minute !== undefined) {
        let h = hour;

        if (ampm) {
            const lower = ampm.toLowerCase();
            if (lower === "pm" && h !== 12) h += 12;
            if (lower === "am" && h === 12) h = 0;
        }

        const hh = String(h).padStart(2, "0");
        const mm = String(minute).padStart(2, "0");

        parts.push(`${hh}:${mm}`);
    }

    return parts.join(" ").trim();
}

function answerFromDetailItem(item) {
    switch (item.dataType) {
        case "list":
            return item.rawValue;
        case "date":
            if (item.rawValue === "") break;
            return formatRawDateTime(item.rawValue);
        // case "monthYear":
        //     const [month, year] = Object.values(item.rawValue);
        //     return format(new Date(`${year}-${month}-1`), "yyyy-MM");
        default:
            return item.value;
    }
}

function detailItemToField(item: DetailItem) {
    return {
        key: item.name,
        title: item.title,
        type: item.dataType,
        answer: answerFromDetailItem(item),
    };
}

export function WebhookModel(relevantPages, details, model, fees) {
    let questions;
    try {
        questions = relevantPages?.map((page) => {
            const isRepeatable = !!page.repeatField;

            const itemsForPage = details.flatMap((detail) =>
                detail.items.filter((item) => item.path === page.path)
            );

            const nonDSIcomponents = itemsForPage.filter(
                (item) => item?.type !== ComponentTypeEnum.DSIAccess
            );

            const detailItems = isRepeatable
                ? [nonDSIcomponents].map((item) => ({ ...item, isRepeatable }))
                : nonDSIcomponents;

            let index = 0;
            const fields = detailItems.flatMap((item, i) => {
                item.isRepeatable ? (index = i) : 0;
                const fields = [detailItemToField(item)];

                /**
                 * This is currently deprecated whilst GDS fix a known issue with accessibility and conditionally revealed fields
                 */
                const nestedItems = item?.items?.childrenCollection.formItems;
                nestedItems &&
                    fields.push(
                        nestedItems.map((item) => detailItemToField(item))
                    );

                return fields;
            });
            return {
                category: page.section?.name,
                question:
                    page.title?.en ??
                    page.title ??
                    page.components.formItems.map((item) => item.title),
                fields,
            };
        });
    } catch (e) {
        debugConsoleLog(e);
    }
    // default name if no name is provided
    let englishName = `${model.basePath}`;
    if (model.name) {
        englishName = model.name.en ?? model.name;
    }
    return {
        metadata: model.def.metadata,
        name: englishName,
        questions: questions,
        ...(!!fees && { fees }),
    };
}
