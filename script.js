let username = 'coalition';
        let password = 'skills-test';
        let auth = btoa(`${username}:${password}`);

        // Authenticate (dummy API)
        fetch('https://fedskillstest.coalitiontechnologies.workers.dev', {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        }).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw response;
        }).then(function (patients) {
            console.log(patients)

            function renderPatients(patientArray) {
                const container = document.getElementById('patient-list');
                container.innerHTML = '';

                patientArray.forEach((patient, index) => {
                    const listItem = document.createElement('div');
                    listItem.className = 'list-item';
                    if (index === 0) {
                        listItem.classList.add('active');
                        updatePatientDetails(patient);
                    }

                    listItem.innerHTML = `
                    <img src="${patient.profile_picture}" alt="Profile Picture">
                    <div class="details">
                        <h6>${patient.name}</h6>
                        <p><span>${patient.gender}</span>, <span>${patient.age}</span></p>
                    </div>
                    <button>
                        <img src="./images/more-icon.svg" alt="More">
                    </button>
                `;

                    listItem.addEventListener('click', () => {
                        document.querySelectorAll('.list-item').forEach(item => item.classList
                            .remove('active'));
                        listItem.classList.add('active');
                        updatePatientDetails(patient);
                        renderChart(patient);
                    });

                    container.appendChild(listItem);
                });
            }

            function updatePatientDetails(patient) {
                function formatDate(dateString) {
                    const month = parseInt(dateString.slice(0, 2), 10) - 1; // Month (0-indexed)
                    const day = parseInt(dateString.slice(3, 5), 10);
                    const year = parseInt(dateString.slice(6), 10);
                    const date = new Date(year, month, day);
                    return date.toLocaleString('default', {
                        month: 'long'
                    }) + ` ${day}, ${year}`;
                }
                document.getElementById('profile-picture').src = patient.profile_picture;
                document.getElementById('profile-name').textContent = patient.name;
                document.getElementById('dob').textContent = formatDate(patient.date_of_birth);
                document.getElementById('gender').textContent = patient.gender;
                document.getElementById('contact-info').textContent = patient.phone_number;
                document.getElementById('emergency-contact').textContent = patient.emergency_contact;
                document.getElementById('insurance-provider').textContent = patient.insurance_type;
                document.getElementById('respiratory-rate').textContent = patient.diagnosis_history[
                        patient.diagnosis_history.length - 1]
                    .respiratory_rate.value + " bpm";
                document.getElementById('respiratory-level').textContent = patient.diagnosis_history[
                    patient.diagnosis_history.length - 1].respiratory_rate.levels;
                document.getElementById('temperature').textContent = patient.diagnosis_history[
                        patient.diagnosis_history.length - 1].temperature
                    .value + " °F";
                document.getElementById('temperature-level').textContent = patient.diagnosis_history[
                        patient.diagnosis_history.length - 1].temperature
                    .levels;
                document.getElementById('heart-rate').textContent = patient.diagnosis_history[
                    patient.diagnosis_history.length - 1].heart_rate.value + " bpm";
                document.getElementById('heart-rate-level').textContent = patient.diagnosis_history[
                    patient.diagnosis_history.length - 1].heart_rate.levels;
            }
            renderPatients(patients);
            // const ctx = document.getElementById('reportChart');
            let bloodPressureChart;

            // Function to extract blood pressure data from diagnosis history
            function getBloodPressureData(diagnosisHistory) {
                const months = diagnosisHistory.map(record => `${record.month.slice(0,3)}, ${record.year}`).reverse().slice(-6);
                const systolic = diagnosisHistory.map(record => record.blood_pressure.systolic.value).reverse().slice(-6);
                const diastolic = diagnosisHistory.map(record => record.blood_pressure.diastolic.value)
                .reverse().slice(-6);

                return {
                    months,
                    systolic,
                    diastolic
                };
            }

            function renderCustomLegend(systolic, diastolic) {
                const customLegend = document.getElementById('customLegend');
                customLegend.innerHTML = `
                    <div class="item">
                        <div class="color-box" style="background-color: #E66FD2;"></div>
                        <div class="label">Systolic</div>
                        <div class="value">${systolic[systolic.length - 1]}</div>
                        <div class="indicator">
                            ${systolic[systolic.length - 1] > 120 ? '▲ Higher than Average' : '▼ Lower than Average'}
                        </div>
                    </div>
                    <div class="item">
                        <div class="color-box" style="background-color: #8C6FE6;"></div>
                        <div class="label">Diastolic</div>
                        <div class="value">${diastolic[diastolic.length - 1]}</div>
                        <div class="indicator">
                            ${diastolic[diastolic.length - 1] < 80 ? '▼ Lower than Average' : '▲ Higher than Average'}
                        </div>
                    </div>
                `;
            }
            
            function renderChart(patient) {
                const {
                    months,
                    systolic,
                    diastolic
                } = getBloodPressureData(patient.diagnosis_history);
            
                const bloodPressureData = {
                    labels: months,
                    datasets: [{
                            label: 'Systolic',
                            data: systolic,
                            borderColor: '#E66FD2',
                            backgroundColor: '#E66FD2',
                            borderWidth: 2,
                            pointBackgroundColor: '#E66FD2',
                            tension: 0.4
                        },
                        {
                            label: 'Diastolic',
                            data: diastolic,
                            borderColor: '#8C6FE6',
                            backgroundColor: '#8C6FE6',
                            borderWidth: 2,
                            pointBackgroundColor: '#8C6FE6',
                            tension: 0.4
                        }
                    ]
                };
            
                const ctx = document.getElementById('reportChart').getContext('2d');
            
                if (bloodPressureChart) {
                    bloodPressureChart.destroy();
                }
            
                bloodPressureChart = new Chart(ctx, {
                    type: 'line',
                    data: bloodPressureData,
                    options: {
                        responsive: true,
                        plugins: {
                            legend: {
                                display: false // Hide default legend
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            },
                        },
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: false,
                                    text: 'Month'
                                }
                            },
                            y: {
                                display: true,
                                title: {
                                    display: false,
                                    text: 'Blood Pressure (mm Hg)'
                                },
                                suggestedMin: 60,
                                suggestedMax: 180
                            }
                        }
                    }
                });
            
                renderCustomLegend(systolic, diastolic);
            }
            renderChart(patients[0]);

        }).catch(function (error) {
            console.warn(error);
        });