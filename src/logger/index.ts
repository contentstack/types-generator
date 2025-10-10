/**
 * Logger factory for types-generator
 * Provides a unified logging interface that works with cli-utilities or standalone
 */

export interface Logger {
  success(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  table?(
    headers: Array<{ value: string }>,
    data: Array<Record<string, any>>
  ): void;
}

/**
 * Basic logger implementation for standalone usage
 * Provides console-based logging with basic formatting
 */
class BasicLogger implements Logger {
  private colorMap: Record<string, string> = {
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
    reset: "\x1b[0m",
    bold: "\x1b[1m",
  };

  print(
    message: string,
    options: { color?: string; bold?: boolean } = {}
  ): void {
    let formattedMessage = message;

    if (options.color && this.colorMap[options.color]) {
      formattedMessage = `${this.colorMap[options.color]}${formattedMessage}${this.colorMap.reset}`;
    }

    if (options.bold) {
      formattedMessage = `${this.colorMap.bold}${formattedMessage}${this.colorMap.reset}`;
    }

    console.log(formattedMessage);
  }

  success(message: string): void {
    this.print(message, { color: "green" });
  }

  info(message: string): void {
    // For blank messages, just print a newline
    if (message === "") {
      console.log();
    } else {
      console.log(message);
    }
  }

  warn(message: string): void {
    this.print(message, { color: "yellow" });
  }

  error(message: string): void {
    this.print(message, { color: "red" });
  }

  table(
    headers: Array<{ value: string }>,
    data: Array<Record<string, any>>
  ): void {
    if (data.length === 0) return;

    // Use console.table if available, otherwise format as text
    if (console.table) {
      console.table(data);
    } else {
      // Fallback formatting for environments without console.table
      const columnWidths: Record<string, number> = {};
      headers.forEach((header) => {
        columnWidths[header.value] = Math.max(
          header.value.length,
          ...data.map((row) => String(row[header.value] || "").length)
        );
      });

      // Print header
      const headerRow = headers
        .map((header) => header.value.padEnd(columnWidths[header.value]))
        .join(" | ");

      this.print(headerRow, { bold: true });
      this.print(
        headers
          .map((header) => "-".repeat(columnWidths[header.value]))
          .join("-|-")
      );

      // Print data rows
      data.forEach((row) => {
        const dataRow = headers
          .map((header) =>
            String(row[header.value] || "").padEnd(columnWidths[header.value])
          )
          .join(" | ");
        this.print(dataRow);
      });
    }
  }
}

/**
 * Creates a logger instance
 * If an external logger is provided (v2 logger from CLI), use it directly
 * Otherwise, uses BasicLogger for standalone usage
 * @param externalLogger - Optional v2 logger instance from CLI
 */
export function createLogger(externalLogger?: any): Logger {
  if (externalLogger) {
    // V2 logger doesn't have table method, so add it as a fallback
    if (!externalLogger.table) {
      externalLogger.table = (
        headers: Array<{ value: string }>,
        data: Array<Record<string, any>>
      ) => {
        console.table(data);
      };
    }
    return externalLogger;
  }
  return new BasicLogger();
}
