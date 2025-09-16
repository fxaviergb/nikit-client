export class AuditUtils {
  static baseAudit() {
    return {
      createdAt: new Date().toISOString(),
      updatedAt: null,
      createdBy: "system",
      updatedBy: null,
    };
  }
}
