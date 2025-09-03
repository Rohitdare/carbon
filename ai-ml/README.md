# AI/ML Service - Blue Carbon MRV Platform

This service provides AI-powered carbon sequestration estimation using satellite imagery, IoT sensor data, and field measurements for blue carbon ecosystems.

## Features

- **Carbon Sequestration Estimation**: Deep learning models to estimate carbon storage in blue carbon ecosystems
- **Satellite Data Integration**: Google Earth Engine integration for vegetation indices calculation
- **IoT Sensor Data Processing**: Real-time processing of environmental sensor data
- **Model Management**: Training, retraining, and validation of AI models
- **Vegetation Indices**: Calculation of NDVI, EVI, SAVI, NDWI, and other indices
- **Historical Analysis**: Trend analysis using historical satellite data

## Technology Stack

- **Framework**: FastAPI
- **ML/AI**: TensorFlow, PyTorch, scikit-learn
- **Satellite Data**: Google Earth Engine API
- **Database**: PostgreSQL with PostGIS
- **Caching**: Redis
- **Containerization**: Docker

## API Endpoints

### Carbon Estimation
- `POST /api/v1/carbon/estimate` - Estimate carbon sequestration
- `GET /api/v1/carbon/estimate/{project_id}/history` - Get estimation history
- `POST /api/v1/carbon/estimate/batch` - Batch estimation

### Satellite Data
- `POST /api/v1/satellite/retrieve` - Retrieve satellite data
- `POST /api/v1/satellite/historical` - Get historical data
- `POST /api/v1/satellite/landcover` - Land cover classification
- `GET /api/v1/satellite/indices/calculate` - Calculate vegetation indices

### Model Management
- `GET /api/v1/models/info` - Get model information
- `POST /api/v1/models/retrain` - Retrain model
- `POST /api/v1/models/predict` - Make prediction
- `POST /api/v1/models/validate` - Validate model
- `GET /api/v1/models/performance` - Get performance metrics
- `POST /api/v1/models/export` - Export model

## Setup and Installation

### Prerequisites
- Python 3.11+
- Docker and Docker Compose
- Google Earth Engine account and credentials

### Environment Variables
Copy `env.example` to `.env` and configure:

```bash
# Server Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=True

# Database Configuration
DATABASE_URL=postgresql://postgres:password@postgres:5432/blue_carbon_mrv
REDIS_URL=redis://redis:6379

# Google Earth Engine Configuration
GEE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GEE_PRIVATE_KEY_PATH=/app/credentials/gee-private-key.json
GEE_PROJECT_ID=your-gcp-project-id

# API Configuration
API_KEY=your-api-key-here
```

### Installation

1. **Using Docker (Recommended)**:
```bash
# Build and run with docker-compose
docker-compose up ai-ml
```

2. **Local Development**:
```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Usage Examples

### Carbon Estimation Request

```python
import requests

# Carbon estimation request
data = {
    "satellite_data": {
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[lon1, lat1], [lon2, lat2], ...]]
        },
        "start_date": "2023-01-01",
        "end_date": "2023-12-31",
        "cloud_cover_threshold": 20.0
    },
    "sensor_data": {
        "temperature": 25.5,
        "humidity": 75.0,
        "soil_moisture": 0.6,
        "salinity": 35.0,
        "ph": 7.5,
        "organic_matter": 3.0
    },
    "field_measurements": {
        "biomass_density": 15.0,
        "canopy_height": 8.0
    },
    "project_data": {
        "area_hectares": 10.0,
        "ecosystem_type": "mangrove",
        "project_id": "PROJ-001"
    }
}

response = requests.post(
    "http://localhost:8000/api/v1/carbon/estimate",
    json=data,
    headers={"Authorization": "Bearer your-api-key"}
)

result = response.json()
print(f"Carbon estimate: {result['carbon_estimate_tonnes_co2_per_hectare_per_year']} tCO2/ha/year")
```

### Satellite Data Retrieval

```python
# Satellite data request
satellite_data = {
    "geometry": {
        "type": "Polygon",
        "coordinates": [[[lon1, lat1], [lon2, lat2], ...]]
    },
    "start_date": "2023-06-01",
    "end_date": "2023-06-30",
    "cloud_cover_threshold": 20.0
}

response = requests.post(
    "http://localhost:8000/api/v1/satellite/retrieve",
    json=satellite_data,
    headers={"Authorization": "Bearer your-api-key"}
)

data = response.json()
print(f"NDVI: {data['vegetation_indices']['ndvi']}")
print(f"EVI: {data['vegetation_indices']['evi']}")
```

## Model Architecture

The carbon estimation model uses a deep neural network with the following architecture:

- **Input Layer**: 14 features (vegetation indices, sensor data, field measurements)
- **Hidden Layers**: 4 layers with batch normalization and dropout
- **Output Layer**: Single value (carbon sequestration in tCO2/ha/year)
- **Activation**: ReLU for hidden layers, linear for output
- **Optimizer**: Adam with learning rate scheduling

### Features Used
- Vegetation indices: NDVI, EVI, SAVI, NDWI
- Environmental factors: temperature, humidity, soil moisture
- Soil properties: salinity, pH, organic matter
- Biomass indicators: biomass density, canopy height
- Spatial data: area, ecosystem type

## Ecosystem Types Supported

- **Mangrove**: Coastal forests with high carbon sequestration potential
- **Saltmarsh**: Coastal wetlands with moderate carbon storage
- **Seagrass**: Underwater meadows with significant carbon burial
- **Tidal Marsh**: Intertidal wetlands with variable carbon storage

## Performance Metrics

The model provides the following performance indicators:

- **Confidence Score**: Model confidence in the prediction (0-1)
- **Data Quality Assessment**: Quality of input data
- **Recommendations**: Suggestions for improving estimates
- **Trend Analysis**: Historical data trends when available

## Health Monitoring

The service provides health check endpoints:

- `GET /health` - Service health status
- `GET /` - Service information

## Development

### Running Tests
```bash
pytest tests/
```

### Code Formatting
```bash
black .
flake8 .
```

### Model Training
The service automatically creates a sample model on first startup. For production:

1. Collect real training data
2. Use the `/api/v1/models/retrain` endpoint
3. Validate with `/api/v1/models/validate`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is part of the Blue Carbon MRV Platform and follows the same licensing terms.

