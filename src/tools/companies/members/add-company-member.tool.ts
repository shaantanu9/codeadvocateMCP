/**
 * Add Company Member Tool
 * 
 * Add a user as a member to the company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface AddCompanyMemberParams {
  companyId: string;
  userId: string;
  role: "admin" | "member" | "viewer";
  employeeId?: string;
  department?: string;
  jobTitle?: string;
  notes?: string;
}

class AddCompanyMemberTool extends BaseToolHandler implements BaseToolDefinition<AddCompanyMemberParams> {
  name = "addCompanyMember";
  description = "Add a user as a member to the company (requires company admin/owner role)";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
    userId: z.string().describe("The ID of the user to add as a member"),
    role: z.enum(["admin", "member", "viewer"]).describe("Role for the member (admin, member, viewer)"),
    employeeId: z.string().optional().describe("Employee ID"),
    department: z.string().optional().describe("Department"),
    jobTitle: z.string().optional().describe("Job title"),
    notes: z.string().optional().describe("Optional notes"),
  });

  async execute(params: AddCompanyMemberParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        user_id: params.userId,
        role: params.role,
      };
      if (params.employeeId) body.employee_id = params.employeeId;
      if (params.department) body.department = params.department;
      if (params.jobTitle) body.job_title = params.jobTitle;
      if (params.notes) body.notes = params.notes;

      const result = await apiService.post(`/api/companies/${params.companyId}/members`, body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Added member to company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Added member to company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to add company member", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const addCompanyMemberTool = new AddCompanyMemberTool();

