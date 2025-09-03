package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// CarbonCreditContract provides functions for managing carbon credits
type CarbonCreditContract struct {
	contractapi.Contract
}

// CarbonCredit represents a carbon credit in the system
type CarbonCredit struct {
	ID              string    `json:"id"`
	ProjectID       string    `json:"projectId"`
	OwnerID         string    `json:"ownerId"`
	Amount          float64   `json:"amount"`
	Type            string    `json:"type"` // blue_carbon, mangrove, seagrass, etc.
	Status          string    `json:"status"` // pending, issued, transferred, retired
	IssuedDate      time.Time `json:"issuedDate"`
	ExpiryDate      time.Time `json:"expiryDate"`
	VerificationID  string    `json:"verificationId"`
	MRVReportID     string    `json:"mrvReportId"`
	BlockchainHash  string    `json:"blockchainHash"`
	Metadata        map[string]interface{} `json:"metadata"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// CreditTransfer represents a transfer of carbon credits
type CreditTransfer struct {
	ID              string    `json:"id"`
	FromOwnerID     string    `json:"fromOwnerId"`
	ToOwnerID       string    `json:"toOwnerId"`
	CreditID        string    `json:"creditId"`
	Amount          float64   `json:"amount"`
	TransferType    string    `json:"transferType"` // sale, donation, retirement
	Price           float64   `json:"price,omitempty"`
	TransactionHash string    `json:"transactionHash"`
	Status          string    `json:"status"` // pending, completed, failed
	CreatedAt       time.Time `json:"createdAt"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
}

// CreditRetirement represents the retirement of carbon credits
type CreditRetirement struct {
	ID              string    `json:"id"`
	CreditID        string    `json:"creditId"`
	OwnerID         string    `json:"ownerId"`
	Amount          float64   `json:"amount"`
	RetirementType  string    `json:"retirementType"` // voluntary, compliance
	Purpose         string    `json:"purpose"`
	CertificateURL  string    `json:"certificateUrl,omitempty"`
	RetirementDate  time.Time `json:"retirementDate"`
	CreatedAt       time.Time `json:"createdAt"`
}

// InitLedger adds a base set of carbon credits to the ledger
func (s *CarbonCreditContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	credits := []CarbonCredit{
		{
			ID:             "credit-001",
			ProjectID:      "project-001",
			OwnerID:        "ngo-001",
			Amount:         100.0,
			Type:           "mangrove",
			Status:         "issued",
			IssuedDate:     time.Now(),
			ExpiryDate:     time.Now().AddDate(10, 0, 0),
			VerificationID: "verify-001",
			MRVReportID:    "mrv-001",
			BlockchainHash: "0x1234567890abcdef",
			Metadata: map[string]interface{}{
				"ecosystem": "mangrove",
				"location":  "Southeast Asia",
				"methodology": "VCS VM0007",
			},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
	}

	for _, credit := range credits {
		creditJSON, err := json.Marshal(credit)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(credit.ID, creditJSON)
		if err != nil {
			return fmt.Errorf("failed to put to world state. %v", err)
		}
	}

	return nil
}

// CreateCredit creates a new carbon credit
func (s *CarbonCreditContract) CreateCredit(ctx contractapi.TransactionContextInterface, creditID, projectID, ownerID string, amount float64, creditType, verificationID, mrvReportID string) error {
	exists, err := s.CreditExists(ctx, creditID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the credit %s already exists", creditID)
	}

	credit := CarbonCredit{
		ID:             creditID,
		ProjectID:      projectID,
		OwnerID:        ownerID,
		Amount:         amount,
		Type:           creditType,
		Status:         "pending",
		IssuedDate:     time.Now(),
		ExpiryDate:     time.Now().AddDate(10, 0, 0), // 10 years expiry
		VerificationID: verificationID,
		MRVReportID:    mrvReportID,
		BlockchainHash: ctx.GetStub().GetTxID(),
		Metadata:       make(map[string]interface{}),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	creditJSON, err := json.Marshal(credit)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(creditID, creditJSON)
}

// IssueCredit issues a pending carbon credit
func (s *CarbonCreditContract) IssueCredit(ctx contractapi.TransactionContextInterface, creditID string) error {
	credit, err := s.ReadCredit(ctx, creditID)
	if err != nil {
		return err
	}

	if credit.Status != "pending" {
		return fmt.Errorf("credit %s is not in pending status", creditID)
	}

	credit.Status = "issued"
	credit.IssuedDate = time.Now()
	credit.UpdatedAt = time.Now()

	creditJSON, err := json.Marshal(credit)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(creditID, creditJSON)
}

// ReadCredit returns the carbon credit stored in the world state with given id
func (s *CarbonCreditContract) ReadCredit(ctx contractapi.TransactionContextInterface, creditID string) (*CarbonCredit, error) {
	creditJSON, err := ctx.GetStub().GetState(creditID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if creditJSON == nil {
		return nil, fmt.Errorf("the credit %s does not exist", creditID)
	}

	var credit CarbonCredit
	err = json.Unmarshal(creditJSON, &credit)
	if err != nil {
		return nil, err
	}

	return &credit, nil
}

// UpdateCredit updates an existing carbon credit in the world state with provided parameters
func (s *CarbonCreditContract) UpdateCredit(ctx contractapi.TransactionContextInterface, creditID, status string, metadata map[string]interface{}) error {
	credit, err := s.ReadCredit(ctx, creditID)
	if err != nil {
		return err
	}

	credit.Status = status
	credit.UpdatedAt = time.Now()
	if metadata != nil {
		credit.Metadata = metadata
	}

	creditJSON, err := json.Marshal(credit)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(creditID, creditJSON)
}

// DeleteCredit deletes a given carbon credit from the world state
func (s *CarbonCreditContract) DeleteCredit(ctx contractapi.TransactionContextInterface, creditID string) error {
	exists, err := s.CreditExists(ctx, creditID)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the credit %s does not exist", creditID)
	}

	return ctx.GetStub().DelState(creditID)
}

// CreditExists returns true when carbon credit with given ID exists in world state
func (s *CarbonCreditContract) CreditExists(ctx contractapi.TransactionContextInterface, creditID string) (bool, error) {
	creditJSON, err := ctx.GetStub().GetState(creditID)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}

	return creditJSON != nil, nil
}

// GetAllCredits returns all carbon credits found in world state
func (s *CarbonCreditContract) GetAllCredits(ctx contractapi.TransactionContextInterface) ([]*CarbonCredit, error) {
	resultsIterator, err := ctx.GetStub().GetStateByRange("", "")
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var credits []*CarbonCredit
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var credit CarbonCredit
		err = json.Unmarshal(queryResponse.Value, &credit)
		if err != nil {
			return nil, err
		}
		credits = append(credits, &credit)
	}

	return credits, nil
}

// GetCreditsByOwner returns all carbon credits owned by a specific owner
func (s *CarbonCreditContract) GetCreditsByOwner(ctx contractapi.TransactionContextInterface, ownerID string) ([]*CarbonCredit, error) {
	queryString := fmt.Sprintf(`{"selector":{"ownerId":"%s"}}`, ownerID)
	return getQueryResultForQueryString(ctx, queryString)
}

// GetCreditsByProject returns all carbon credits for a specific project
func (s *CarbonCreditContract) GetCreditsByProject(ctx contractapi.TransactionContextInterface, projectID string) ([]*CarbonCredit, error) {
	queryString := fmt.Sprintf(`{"selector":{"projectId":"%s"}}`, projectID)
	return getQueryResultForQueryString(ctx, queryString)
}

// GetCreditsByStatus returns all carbon credits with a specific status
func (s *CarbonCreditContract) GetCreditsByStatus(ctx contractapi.TransactionContextInterface, status string) ([]*CarbonCredit, error) {
	queryString := fmt.Sprintf(`{"selector":{"status":"%s"}}`, status)
	return getQueryResultForQueryString(ctx, queryString)
}

// TransferCredit transfers ownership of a carbon credit
func (s *CarbonCreditContract) TransferCredit(ctx contractapi.TransactionContextInterface, creditID, fromOwnerID, toOwnerID string, amount float64, transferType string, price float64) error {
	credit, err := s.ReadCredit(ctx, creditID)
	if err != nil {
		return err
	}

	if credit.OwnerID != fromOwnerID {
		return fmt.Errorf("credit %s is not owned by %s", creditID, fromOwnerID)
	}

	if credit.Status != "issued" {
		return fmt.Errorf("credit %s is not in issued status", creditID)
	}

	if credit.Amount < amount {
		return fmt.Errorf("insufficient credit amount. Available: %f, Requested: %f", credit.Amount, amount)
	}

	// Create transfer record
	transferID := fmt.Sprintf("transfer-%s-%d", creditID, time.Now().Unix())
	transfer := CreditTransfer{
		ID:              transferID,
		FromOwnerID:     fromOwnerID,
		ToOwnerID:       toOwnerID,
		CreditID:        creditID,
		Amount:          amount,
		TransferType:    transferType,
		Price:           price,
		TransactionHash: ctx.GetStub().GetTxID(),
		Status:          "pending",
		CreatedAt:       time.Now(),
	}

	transferJSON, err := json.Marshal(transfer)
	if err != nil {
		return err
	}

	// Store transfer record
	err = ctx.GetStub().PutState(transferID, transferJSON)
	if err != nil {
		return err
	}

	// Update credit ownership
	if credit.Amount == amount {
		// Full transfer
		credit.OwnerID = toOwnerID
		credit.Status = "transferred"
	} else {
		// Partial transfer - create new credit for remaining amount
		remainingCreditID := fmt.Sprintf("%s-remaining-%d", creditID, time.Now().Unix())
		remainingCredit := *credit
		remainingCredit.ID = remainingCreditID
		remainingCredit.Amount = credit.Amount - amount
		remainingCredit.CreatedAt = time.Now()
		remainingCredit.UpdatedAt = time.Now()

		remainingCreditJSON, err := json.Marshal(remainingCredit)
		if err != nil {
			return err
		}

		err = ctx.GetStub().PutState(remainingCreditID, remainingCreditJSON)
		if err != nil {
			return err
		}

		// Update original credit
		credit.OwnerID = toOwnerID
		credit.Amount = amount
		credit.Status = "transferred"
	}

	credit.UpdatedAt = time.Now()
	creditJSON, err := json.Marshal(credit)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(creditID, creditJSON)
}

// RetireCredit retires a carbon credit permanently
func (s *CarbonCreditContract) RetireCredit(ctx contractapi.TransactionContextInterface, creditID, ownerID string, amount float64, retirementType, purpose string) error {
	credit, err := s.ReadCredit(ctx, creditID)
	if err != nil {
		return err
	}

	if credit.OwnerID != ownerID {
		return fmt.Errorf("credit %s is not owned by %s", creditID, ownerID)
	}

	if credit.Status != "issued" {
		return fmt.Errorf("credit %s is not in issued status", creditID)
	}

	if credit.Amount < amount {
		return fmt.Errorf("insufficient credit amount. Available: %f, Requested: %f", credit.Amount, amount)
	}

	// Create retirement record
	retirementID := fmt.Sprintf("retirement-%s-%d", creditID, time.Now().Unix())
	retirement := CreditRetirement{
		ID:             retirementID,
		CreditID:       creditID,
		OwnerID:        ownerID,
		Amount:         amount,
		RetirementType: retirementType,
		Purpose:        purpose,
		RetirementDate: time.Now(),
		CreatedAt:      time.Now(),
	}

	retirementJSON, err := json.Marshal(retirement)
	if err != nil {
		return err
	}

	// Store retirement record
	err = ctx.GetStub().PutState(retirementID, retirementJSON)
	if err != nil {
		return err
	}

	// Update credit status
	if credit.Amount == amount {
		// Full retirement
		credit.Status = "retired"
	} else {
		// Partial retirement
		credit.Amount = credit.Amount - amount
		credit.Status = "partially_retired"
	}

	credit.UpdatedAt = time.Now()
	creditJSON, err := json.Marshal(credit)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState(creditID, creditJSON)
}

// GetCreditHistory returns the transaction history for a specific credit
func (s *CarbonCreditContract) GetCreditHistory(ctx contractapi.TransactionContextInterface, creditID string) ([]map[string]interface{}, error) {
	historyIterator, err := ctx.GetStub().GetHistoryForKey(creditID)
	if err != nil {
		return nil, err
	}
	defer historyIterator.Close()

	var history []map[string]interface{}
	for historyIterator.HasNext() {
		historyResponse, err := historyIterator.Next()
		if err != nil {
			return nil, err
		}

		var credit CarbonCredit
		if len(historyResponse.Value) > 0 {
			err = json.Unmarshal(historyResponse.Value, &credit)
			if err != nil {
				return nil, err
			}
		}

		historyRecord := map[string]interface{}{
			"txId":      historyResponse.TxId,
			"timestamp": historyResponse.Timestamp,
			"isDelete":  historyResponse.IsDelete,
			"value":     credit,
		}
		history = append(history, historyRecord)
	}

	return history, nil
}

// GetTotalCreditsByType returns the total amount of credits by type
func (s *CarbonCreditContract) GetTotalCreditsByType(ctx contractapi.TransactionContextInterface, creditType string) (float64, error) {
	queryString := fmt.Sprintf(`{"selector":{"type":"%s","status":"issued"}}`, creditType)
	credits, err := getQueryResultForQueryString(ctx, queryString)
	if err != nil {
		return 0, err
	}

	total := 0.0
	for _, credit := range credits {
		total += credit.Amount
	}

	return total, nil
}

// Helper function to execute a query string
func getQueryResultForQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]*CarbonCredit, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var credits []*CarbonCredit
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var credit CarbonCredit
		err = json.Unmarshal(queryResponse.Value, &credit)
		if err != nil {
			return nil, err
		}
		credits = append(credits, &credit)
	}

	return credits, nil
}

func main() {
	carbonCreditContract, err := contractapi.NewChaincode(&CarbonCreditContract{})
	if err != nil {
		fmt.Printf("Error creating carbon credit chaincode: %v", err)
		return
	}

	if err := carbonCreditContract.Start(); err != nil {
		fmt.Printf("Error starting carbon credit chaincode: %v", err)
	}
}

