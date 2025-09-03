import { api } from './api';
import { CarbonCredit, PaginatedResponse, SearchParams } from '@/types';

export class CarbonCreditService {
  // Get all carbon credits with pagination and filters
  static async getCredits(params?: SearchParams): Promise<PaginatedResponse<CarbonCredit>> {
    const response = await api.get<PaginatedResponse<CarbonCredit>>('/carbon-credits', params);
    return response.data;
  }

  // Get carbon credit by ID
  static async getCredit(id: string): Promise<CarbonCredit> {
    const response = await api.get<CarbonCredit>(`/carbon-credits/${id}`);
    return response.data;
  }

  // Issue carbon credit
  static async issueCredit(creditData: Omit<CarbonCredit, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarbonCredit> {
    const response = await api.post<CarbonCredit>('/carbon-credits', creditData);
    return response.data;
  }

  // Transfer carbon credit
  static async transferCredit(id: string, toUserId: string, amount: number): Promise<CarbonCredit> {
    const response = await api.post<CarbonCredit>(`/carbon-credits/${id}/transfer`, {
      toUserId,
      amount,
    });
    return response.data;
  }

  // Retire carbon credit
  static async retireCredit(id: string, retirementReason: string): Promise<CarbonCredit> {
    const response = await api.post<CarbonCredit>(`/carbon-credits/${id}/retire`, {
      retirementReason,
    });
    return response.data;
  }

  // Get credits by project
  static async getCreditsByProject(projectId: string): Promise<CarbonCredit[]> {
    const response = await api.get<CarbonCredit[]>(`/carbon-credits/project/${projectId}`);
    return response.data;
  }

  // Get credits by status
  static async getCreditsByStatus(status: string): Promise<CarbonCredit[]> {
    const response = await api.get<CarbonCredit[]>(`/carbon-credits/status/${status}`);
    return response.data;
  }

  // Get credits by user
  static async getCreditsByUser(userId: string): Promise<CarbonCredit[]> {
    const response = await api.get<CarbonCredit[]>(`/carbon-credits/user/${userId}`);
    return response.data;
  }

  // Get credit statistics
  static async getCreditStatistics(): Promise<{
    total: number;
    issued: number;
    transferred: number;
    retired: number;
    pending: number;
    totalValue: number;
    byStatus: Record<string, number>;
    byVintage: Record<string, number>;
  }> {
    const response = await api.get('/carbon-credits/statistics');
    return response.data;
  }

  // Get credit history
  static async getCreditHistory(id: string): Promise<any[]> {
    const response = await api.get<any[]>(`/carbon-credits/${id}/history`);
    return response.data;
  }

  // Get blockchain transaction details
  static async getBlockchainTransaction(transactionHash: string): Promise<any> {
    const response = await api.get(`/blockchain/transactions/${transactionHash}`);
    return response.data;
  }

  // Verify credit on blockchain
  static async verifyCreditOnBlockchain(id: string): Promise<{
    verified: boolean;
    transactionHash?: string;
    blockNumber?: number;
  }> {
    const response = await api.get(`/carbon-credits/${id}/blockchain-verify`);
    return response.data;
  }

  // Get credit certificate
  static async getCreditCertificate(id: string): Promise<Blob> {
    const response = await api.get(`/carbon-credits/${id}/certificate`, {}, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Export credits data
  static async exportCredits(format: 'csv' | 'excel' | 'pdf', filters?: any): Promise<Blob> {
    const response = await api.get('/carbon-credits/export', {
      format,
      ...filters,
    }, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Get credit marketplace data
  static async getMarketplaceData(): Promise<{
    availableCredits: CarbonCredit[];
    averagePrice: number;
    priceHistory: Array<{ date: string; price: number }>;
    volumeHistory: Array<{ date: string; volume: number }>;
  }> {
    const response = await api.get('/carbon-credits/marketplace');
    return response.data;
  }

  // List credit for sale
  static async listCreditForSale(id: string, price: number, description?: string): Promise<void> {
    await api.post(`/carbon-credits/${id}/list`, {
      price,
      description,
    });
  }

  // Remove credit from sale
  static async removeCreditFromSale(id: string): Promise<void> {
    await api.delete(`/carbon-credits/${id}/list`);
  }

  // Purchase credit
  static async purchaseCredit(id: string, amount: number): Promise<CarbonCredit> {
    const response = await api.post<CarbonCredit>(`/carbon-credits/${id}/purchase`, {
      amount,
    });
    return response.data;
  }

  // Get credit portfolio
  static async getCreditPortfolio(userId: string): Promise<{
    totalCredits: number;
    totalValue: number;
    creditsByStatus: Record<string, number>;
    creditsByProject: Array<{ projectId: string; projectName: string; credits: number }>;
    recentTransactions: any[];
  }> {
    const response = await api.get(`/carbon-credits/portfolio/${userId}`);
    return response.data;
  }

  // Get credit analytics
  static async getCreditAnalytics(timeRange: '7d' | '30d' | '90d' | '1y'): Promise<{
    issuanceTrend: Array<{ date: string; amount: number }>;
    retirementTrend: Array<{ date: string; amount: number }>;
    priceTrend: Array<{ date: string; price: number }>;
    volumeTrend: Array<{ date: string; volume: number }>;
  }> {
    const response = await api.get('/carbon-credits/analytics', { timeRange });
    return response.data;
  }

  // Validate credit data
  static async validateCreditData(creditData: Partial<CarbonCredit>): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const response = await api.post('/carbon-credits/validate', creditData);
    return response.data;
  }

  // Bulk transfer credits
  static async bulkTransferCredits(creditIds: string[], toUserId: string): Promise<void> {
    await api.post('/carbon-credits/bulk-transfer', {
      creditIds,
      toUserId,
    });
  }

  // Get credit audit trail
  static async getCreditAuditTrail(id: string): Promise<any[]> {
    const response = await api.get<any[]>(`/carbon-credits/${id}/audit-trail`);
    return response.data;
  }

  // Get credit compliance status
  static async getCreditComplianceStatus(id: string): Promise<{
    compliant: boolean;
    standards: string[];
    certifications: string[];
    expiryDate?: string;
  }> {
    const response = await api.get(`/carbon-credits/${id}/compliance`);
    return response.data;
  }
}

