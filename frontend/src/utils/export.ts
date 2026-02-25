import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";
import { Share } from "react-native";

const csvEscape = (value: unknown) => {
  const text = String(value ?? "");
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

export const toCsv = (headers: string[], rows: Array<Array<unknown>>) => {
  const headerLine = headers.map(csvEscape).join(",");
  const rowLines = rows.map((row) => row.map(csvEscape).join(","));
  return [headerLine, ...rowLines].join("\n");
};

const safeFileBase = (fileBaseName: string) =>
  fileBaseName.replace(/[^a-zA-Z0-9-_]/g, "_");

export const exportCsvFile = async ({
  fileBaseName,
  headers,
  rows,
  title,
}: {
  fileBaseName: string;
  headers: string[];
  rows: Array<Array<unknown>>;
  title?: string;
}) => {
  const csv = toCsv(headers, rows);
  const fileName = `${safeFileBase(fileBaseName)}-${Date.now()}.csv`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: title || "Export CSV",
      UTI: "public.comma-separated-values-text",
    });
    return;
  }

  await Share.share({
    title: title || "Export CSV",
    message: csv,
  });
};

export const exportPdfFromHtml = async ({
  html,
  title,
}: {
  html: string;
  title?: string;
}) => {
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: title || "Export PDF",
      UTI: "com.adobe.pdf",
    });
    return;
  }

  await Share.share({
    title: title || "Export PDF",
    message: "PDF generated but file sharing is unavailable on this device.",
  });
};
