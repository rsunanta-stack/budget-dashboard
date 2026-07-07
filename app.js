// JavaScript logic for CSE Walailak University Budget Dashboard

// =========================================================================
// GOOGLE SHEETS LIVE INTEGRATION CONFIGURATION (ตั้งค่าการเชื่อมต่อ Google Sheets)
// =========================================================================
// 1. SHEET_ID: รหัสของไฟล์ Google Sheets (ตัวอักษรและตัวเลขยาวๆ ใน URL ระหว่าง /d/ และ /edit)
// 2. SHEET_NAME_1: ชื่อชีท (ชื่อแท็บ) แท็บที่ 1 ของวิทยาศาสตร์และเทคโนโลยี
// 3. SHEET_NAME_2: ชื่อชีท (ชื่อแท็บ) แท็บที่ 2 ของวิทยาศาสตร์สุขภาพ
// * หมายเหตุ: คุณต้องทำการแชร์ไฟล์ Google Sheets เป็น "ทุกคนที่มีลิงก์สามารถดูได้" (Anyone with the link can view) ด้วยนะครับ *
// =========================================================================
const SHEET_ID = "1TE7ksPMwn6xvt6yEt8j06IHvTtpfoqyLycqu0DvJmNo"; // รหัสไฟล์ Google Sheets ของคุณ
const SHEET_NAME_1 = "วิทย์เทค(แบบแยก)";                        // ชื่อแท็บฝั่งวิทย์-เทค
const SHEET_NAME_2 = "วิทย์สุข(แบบแยก)";                        // ชื่อแท็บฝั่งวิทย์-สุข

document.addEventListener("DOMContentLoaded", () => {
    
    const GOOGLE_SHEETS_CONFIG = {
        enabled: true, // เปิดใช้งานดึงข้อมูลสดจาก Google Sheets ทันที
        spreadsheetId: SHEET_ID,
        techSheetName: SHEET_NAME_1,
        healthSheetName: SHEET_NAME_2
    };

    // 1. Initial State Setup
    const state = {
        items: [],
        filteredItems: [],
        currentPage: 1,
        pageSize: 10,
        sortColumn: null, // Default to null to preserve the original sheet order
        sortDirection: 'asc',
        filters: {
            search: '',
            type: '',
            faculty: ''
        },
        charts: {
            share: null,
            schools: null
        }
    };

    // 2. DOM Elements
    const elements = {
        body: document.body,
        themeToggle: document.getElementById("theme-toggle"),
        dateString: document.getElementById("date-string"),
        currentDateBadge: document.getElementById("current-date-badge"),
        phaseAlertBox: document.getElementById("phase-alert-box"),
        timelineContainer: document.getElementById("timeline-container"),
        
        // Metrics
        valTechBudget: document.getElementById("val-tech-budget"),
        valTechCount: document.getElementById("val-tech-count"),
        valHealthBudget: document.getElementById("val-health-budget"),
        valHealthCount: document.getElementById("val-health-count"),
        valTotalBudget: document.getElementById("val-total-budget"),
        valTotalCount: document.getElementById("val-total-count"),
        
        // Filters
        searchInput: document.getElementById("search-input"),
        filterType: document.getElementById("filter-type"),
        filterFaculty: document.getElementById("filter-faculty"),
        btnClearFilters: document.getElementById("btn-clear-filters"),
        
        // Table & Pagination
        tableBody: document.getElementById("table-body"),
        paginationInfo: document.getElementById("pagination-info"),
        btnPrev: document.getElementById("btn-prev"),
        btnNext: document.getElementById("btn-next"),
        
        // Headers for sorting
        thPriority: document.getElementById("th-priority"),
        thType: document.getElementById("th-type"),
        thName: document.getElementById("th-name"),
        thFaculty: document.getElementById("th-faculty"),
        thQty: document.getElementById("th-qty"),
        thPrice: document.getElementById("th-price"),
        thTotal: document.getElementById("th-total"),
        thRequester: document.getElementById("th-requester"),
        thSpecMaker: document.getElementById("th-specmaker"),
        
        // Modal
        modalDetail: document.getElementById("modal-detail"),
        modalCloseBtn: document.getElementById("modal-close-btn"),
        modalBadgeType: document.getElementById("modal-badge-type"),
        modalItemName: document.getElementById("modal-item-name"),
        modalFaculty: document.getElementById("modal-faculty"),
        modalDepartment: document.getElementById("modal-department"),
        modalQty: document.getElementById("modal-qty"),
        modalTotalPrice: document.getElementById("modal-total-price"),
        modalLocation: document.getElementById("modal-location"),
        modalRequester: document.getElementById("modal-requester"),
        modalSpecMaker: document.getElementById("modal-spec-maker"),
        modalNeedType: document.getElementById("modal-need-type"),
        modalExistingStatus: document.getElementById("modal-existing-status"),
        modalNeedDetail: document.getElementById("modal-need-detail"),
        modalQuotesGrid: document.getElementById("modal-quotes-grid"),
        modalBtnQuote: document.getElementById("modal-btn-quote"),
        modalBtnImage: document.getElementById("modal-btn-image")
    };

    // Today's actual date (Dynamic)
    const TODAY = new Date();

    // 3. Format Helpers
    function formatCurrency(amount) {
        return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);
    }

    // Format numbers with commas (e.g. 1,000)
    function formatNumber(num) {
        return new Intl.NumberFormat('th-TH').format(num);
    }

    // Alphanumeric sorting helper for priority column (handles 1, 2, 10, ENH 9 naturally)
    function naturalCompare(a, b) {
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    }

    // 4. Update Header Date
    function initDateHeader() {
        const thaiMonths = [
            "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
            "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
        ];
        const day = TODAY.getDate();
        const month = thaiMonths[TODAY.getMonth()];
        const year = TODAY.getFullYear() + 543; // Convert AD to BE
        if (elements.dateString) {
            elements.dateString.textContent = `${day} ${month} ${year}`;
        }
    }

    // 5. Build Timeline
    function initTimeline() {
        if (elements.timelineContainer) {
            elements.timelineContainer.innerHTML = '';
        }
        let activeStep = null;
        let activeStepIndex = -1;

        // Clear time of TODAY for date-only comparison (midnight local time)
        const todayMidnight = new Date(TODAY.getTime());
        todayMidnight.setHours(0, 0, 0, 0);

        TIMELINE_DATA.forEach((step, idx) => {
            const stepEl = document.createElement("div");
            stepEl.className = "timeline-step";
            
            // Parse and clear time of start/end dates
            const start = new Date(step.startDate);
            start.setHours(0, 0, 0, 0);
            
            const end = new Date(step.endDate);
            end.setHours(0, 0, 0, 0);
            
            let status = "pending"; // pending, active, completed
            
            if (todayMidnight > end) {
                status = "completed";
                stepEl.classList.add("completed");
            } else if (todayMidnight >= start && todayMidnight <= end) {
                status = "active";
                stepEl.classList.add("active");
                activeStep = step;
                activeStepIndex = idx;
            }

            stepEl.innerHTML = `
                <div class="step-num">${step.id}</div>
                <div class="step-date">${step.date}</div>
                <div class="step-title">${step.title}</div>
                <div class="step-desc">${step.detail}</div>
            `;
            if (elements.timelineContainer) {
                elements.timelineContainer.appendChild(stepEl);
            }
        });

        // Center on active step
        if (activeStepIndex !== -1) {
            setTimeout(() => {
                if (elements.timelineContainer) {
                    const scrollOffset = activeStepIndex * 266 - (elements.timelineContainer.clientWidth / 2) + 125;
                    elements.timelineContainer.scrollLeft = Math.max(0, scrollOffset);
                }
            }, 100);

            // Update alert banner
            if (elements.phaseAlertBox) {
                elements.phaseAlertBox.innerHTML = `
                    <strong>ขั้นตอนปัจจุบัน:</strong> ขั้นตอนที่ ${activeStep.id} - ${activeStep.title} (${activeStep.date})<br>
                    <span style="font-size: 0.85rem; opacity: 0.9;">รายละเอียด: ${activeStep.detail}</span>
                `;
            }
        } else {
            // Fallback if no step is currently active
            if (elements.phaseAlertBox) {
                elements.phaseAlertBox.innerHTML = `
                    <strong>สถานะระบบ:</strong> นอกเหนือระยะเวลาแผนงานจัดซื้อจัดจ้างงบลงทุนปี 2570 แล้ว<br>
                    <span style="font-size: 0.85rem; opacity: 0.9;">สืบค้นประวัติขั้นตอนโดยการเลื่อนแถบด้านล่าง</span>
                `;
            }
        }
    }

    // 6. Calculate and Update KPI Metrics (บวกเลขยอดรวมใหม่ด้วยโค้ด ห้ามดึงจากตารางสรุป)
    function updateKPIs() {
        let techBudget = 0;
        let techCount = 0;
        let healthBudget = 0;
        let healthCount = 0;

        state.items.forEach(item => {
            if (item.type === 'science_tech') {
                techBudget += item.totalPrice;
                techCount++;
            } else if (item.type === 'science_health') {
                healthBudget += item.totalPrice;
                healthCount++;
            }
        });

        const totalBudget = techBudget + healthBudget;
        const totalCount = techCount + healthCount;

        if (elements.valTechBudget) elements.valTechBudget.textContent = formatCurrency(techBudget);
        if (elements.valTechCount) elements.valTechCount.textContent = `${formatNumber(techCount)} รายการ`;
        
        if (elements.valHealthBudget) elements.valHealthBudget.textContent = formatCurrency(healthBudget);
        if (elements.valHealthCount) elements.valHealthCount.textContent = `${formatNumber(healthCount)} รายการ`;

        if (elements.valTotalBudget) elements.valTotalBudget.textContent = formatCurrency(totalBudget);
        if (elements.valTotalCount) elements.valTotalCount.textContent = `${formatNumber(totalCount)} รายการ`;
    }

    // 7. Populating Filter Dropdowns dynamically
    function initFilterOptions() {
        if (!elements.filterFaculty) return;
        elements.filterFaculty.innerHTML = '<option value="">-- หน่วยงานทั้งหมด --</option>';
        const faculties = new Set();

        state.items.forEach(item => {
            if (item.faculty) faculties.add(item.faculty);
            
            // Also inspect child items for faculties
            if (item.children) {
                item.children.forEach(child => {
                    if (child.faculty) faculties.add(child.faculty);
                });
            }
        });

        // Populate Faculty dropdown
        Array.from(faculties).sort().forEach(fac => {
            const opt = document.createElement("option");
            opt.value = fac;
            opt.textContent = fac;
            elements.filterFaculty.appendChild(opt);
        });
    }

    // 8. Visualizations / Charts Rendering (using Chart.js)
    function renderCharts() {
        // Destroy existing chart objects to prevent overlays
        if (state.charts.share) state.charts.share.destroy();
        if (state.charts.schools) state.charts.schools.destroy();

        const isDark = elements.body ? elements.body.classList.contains("dark-theme") : true;
        const textColor = isDark ? "#ECEAF5" : "#2d2645";
        const gridColor = isDark ? "rgba(126, 101, 194, 0.12)" : "rgba(89, 69, 140, 0.08)";

        // Chart 1: Budget Share (using filtered parent budgets)
        let techSum = 0;
        let healthSum = 0;
        state.filteredItems.forEach(item => {
            if (item.type === 'science_tech') techSum += item.totalPrice;
            else healthSum += item.totalPrice;
        });

        const shareCanvas = document.getElementById("chart-share");
        if (shareCanvas) {
            const shareCtx = shareCanvas.getContext("2d");
            state.charts.share = new Chart(shareCtx, {
                type: 'pie',
                data: {
                    labels: ['วิทยาศาสตร์และเทคโนโลยี', 'วิทยาศาสตร์สุขภาพ'],
                    datasets: [{
                        data: [techSum, healthSum],
                        backgroundColor: ['#7E65C2', '#E37222'],
                        borderWidth: isDark ? 2 : 1,
                        borderColor: isDark ? '#13111d' : '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: textColor, font: { family: 'Sarabun' } }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ` ${context.label}: ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Chart 2: Top Schools by Budget (aggregating budgets based on child requests)
        const schoolBudgets = {};
        state.filteredItems.forEach(item => {
            // If the item has children, aggregate by the child's faculty!
            if (item.filteredChildren && item.filteredChildren.length > 0) {
                item.filteredChildren.forEach(child => {
                    if (!child.faculty) return;
                    schoolBudgets[child.faculty] = (schoolBudgets[child.faculty] || 0) + child.totalPrice;
                });
            } else {
                if (!item.faculty) return;
                schoolBudgets[item.faculty] = (schoolBudgets[item.faculty] || 0) + item.totalPrice;
            }
        });

        const sortedSchools = Object.keys(schoolBudgets)
            .map(key => ({ name: key, budget: schoolBudgets[key] }))
            .sort((a, b) => b.budget - a.budget)
            .slice(0, 5);

        const schoolsCanvas = document.getElementById("chart-schools");
        if (schoolsCanvas) {
            const schoolsCtx = schoolsCanvas.getContext("2d");
            state.charts.schools = new Chart(schoolsCtx, {
                type: 'bar',
                data: {
                    labels: sortedSchools.map(s => s.name),
                    datasets: [{
                        label: 'งบประมาณรวม (บาท)',
                        data: sortedSchools.map(s => s.budget),
                        backgroundColor: '#F1B521',
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ` ${formatCurrency(context.raw)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                font: { family: 'Sarabun', size: 10 },
                                callback: function(value) {
                                    return value >= 1e6 ? (value / 1e6) + 'M' : value;
                                }
                            }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: textColor, font: { family: 'Sarabun', size: 10 } }
                        }
                    }
                }
            });
        }
    }

    // 9. Table Rendering, Sorting, Pagination and Filtering
    function renderTable() {
        const tbody = elements.tableBody;
        if (!tbody) return;
        tbody.innerHTML = '';

        // Apply Hierarchical Filtering
        state.filteredItems = state.items.map(parent => {
            const searchLower = state.filters.search.toLowerCase();
            
            // Check if parent itself matches the search query
            const matchesParentSearch = !state.filters.search || 
                parent.name.toLowerCase().includes(searchLower) ||
                parent.requester.toLowerCase().includes(searchLower) ||
                parent.specMaker.toLowerCase().includes(searchLower) ||
                parent.location.toLowerCase().includes(searchLower);

            // Check if any of its children match the search query
            const matchingChildren = parent.children ? parent.children.filter(child => {
                return !state.filters.search || 
                    child.name.toLowerCase().includes(searchLower) ||
                    child.requester.toLowerCase().includes(searchLower) ||
                    child.specMaker.toLowerCase().includes(searchLower) ||
                    child.location.toLowerCase().includes(searchLower);
            }) : [];

            const hasMatchingChildren = matchingChildren.length > 0;
            const matchesSearch = matchesParentSearch || hasMatchingChildren;

            // Check category filter
            const matchesType = !state.filters.type || parent.type === state.filters.type;

            // Check faculty filter
            const matchesFaculty = !state.filters.faculty || 
                parent.faculty === state.filters.faculty || 
                (parent.children && parent.children.some(child => child.faculty === state.filters.faculty));

            if (matchesSearch && matchesType && matchesFaculty) {
                // If the filter specifies a faculty, we only show matching children!
                const finalChildren = state.filters.faculty 
                    ? parent.children.filter(c => c.faculty === state.filters.faculty)
                    : (hasMatchingChildren ? matchingChildren : parent.children);

                return {
                    ...parent,
                    filteredChildren: finalChildren
                };
            }
            return null;
        }).filter(item => item !== null);

        // Apply Sorting (Sorts parent rows)
        if (state.sortColumn) {
            state.filteredItems.sort((a, b) => {
                let valA = a[state.sortColumn];
                let valB = b[state.sortColumn];

                // Handle natural alphanumeric sorting for Priority (Column A)
                if (state.sortColumn === 'priority') {
                    valA = valA ? valA.toString() : "";
                    valB = valB ? valB.toString() : "";
                    return state.sortDirection === 'asc' 
                        ? naturalCompare(valA, valB) 
                        : naturalCompare(valB, valA);
                }

                // Text compare
                if (typeof valA === 'string') {
                    return state.sortDirection === 'asc' 
                        ? valA.localeCompare(valB, 'th') 
                        : valB.localeCompare(valA, 'th');
                }
                
                // Number compare
                return state.sortDirection === 'asc' ? valA - valB : valB - valA;
            });
        }

        // Apply Pagination
        const totalItems = state.filteredItems.length;
        const totalPages = Math.ceil(totalItems / state.pageSize) || 1;
        
        // Boundaries checks
        if (state.currentPage > totalPages) state.currentPage = totalPages;
        if (state.currentPage < 1) state.currentPage = 1;

        const startIndex = (state.currentPage - 1) * state.pageSize;
        const endIndex = Math.min(startIndex + state.pageSize, totalItems);
        const paginatedItems = state.filteredItems.slice(startIndex, endIndex);

        // Render Table Rows
        if (paginatedItems.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center" style="padding: 40px; color: var(--text-secondary);">
                        ❌ ไม่พบรายการที่ตรงกับตัวกรองที่เลือก
                    </td>
                </tr>
            `;
        } else {
            paginatedItems.forEach((item) => {
                const row = document.createElement("tr");
                row.className = "table-row-parent table-row-item";
                row.dataset.id = item.id;
                
                const badgeClass = item.type === 'science_tech' ? 'badge-tech' : 'badge-health';
                const badgeLabel = item.type === 'science_tech' ? 'วิทย์-เทค' : 'วิทย์-สุข';
                
                const hasChildren = item.filteredChildren && item.filteredChildren.length > 0;

                // Render Parent Row
                row.innerHTML = `
                    <td class="text-center" style="font-weight:700; color:var(--text-secondary);">${item.priority || "-"}</td>
                    <td class="text-center"><span class="badge ${badgeClass}">${badgeLabel}</span></td>
                    <td class="parent-name-cell" style="line-height:1.5;">
                        ${hasChildren ? `
                            <span class="toggle-trigger">
                                <span class="toggle-icon">▶</span>
                            </span>
                        ` : ''}
                        <span>${item.name}</span>
                    </td>
                    <td>${item.faculty || "-"}</td>
                    <td class="text-center">${item.quantity} ${item.unit}</td>
                    <td class="number-col">${formatNumber(item.unitPrice)} ฿</td>
                    <td class="number-col" style="color:var(--secondary); font-weight:700;">${formatNumber(item.totalPrice)} ฿</td>
                    <td>${item.requester || "-"}</td>
                    <td>${item.specMaker || "-"}</td>
                `;

                // If it has children, set up the expand/collapse click behavior on the toggle arrow
                if (hasChildren) {
                    const toggleTrigger = row.querySelector(".toggle-trigger");
                    if (toggleTrigger) {
                        toggleTrigger.addEventListener("click", (e) => {
                            e.stopPropagation(); // Prevent row click from opening the modal details!
                            
                            const childRows = tbody.querySelectorAll(`.child-of-${item.id}`);
                            const toggleIcon = row.querySelector(".toggle-icon");
                            if (toggleIcon) {
                                const isOpen = toggleIcon.classList.contains("open");
                                if (isOpen) {
                                    toggleIcon.classList.remove("open");
                                    childRows.forEach(r => r.style.display = "none");
                                } else {
                                    toggleIcon.classList.add("open");
                                    childRows.forEach(r => r.style.display = "table-row");
                                }
                            }
                        });
                    }
                }

                // Parent row itself opens the modal details when clicked
                row.addEventListener("click", () => showDetailModal(item.id));
                tbody.appendChild(row);

                // Render Child Rows
                if (hasChildren) {
                    item.filteredChildren.forEach((child, childIdx) => {
                        const childRow = document.createElement("tr");
                        childRow.className = `table-row-child table-row-item child-of-${item.id}`;
                        childRow.style.display = "none";
                        childRow.dataset.id = child.id;
                        
                        childRow.innerHTML = `
                            <td class="text-center" style="font-weight:600; color:var(--text-secondary); opacity: 0.85;">${item.priority}.${childIdx + 1}</td>
                            <td class="text-center"><span class="badge ${badgeClass}" style="opacity: 0.75;">${badgeLabel}</span></td>
                            <td style="padding-left: 28px; font-weight:500;">
                                <span style="opacity: 0.4; margin-right: 6px;">└─</span>
                                ${child.name}
                            </td>
                            <td>${child.faculty || "-"}</td>
                            <td class="text-center" style="opacity: 0.9;">${child.quantity} ${child.unit}</td>
                            <td class="number-col" style="opacity: 0.9;">${formatNumber(child.unitPrice)} ฿</td>
                            <td class="number-col" style="font-weight:600; color:var(--text-primary);">${formatNumber(child.totalPrice)} ฿</td>
                            <td style="opacity: 0.9;">${child.requester || "-"}</td>
                            <td style="opacity: 0.9;">${child.specMaker || "-"}</td>
                        `;
                        
                        // Child row click opens its specific detail modal
                        childRow.addEventListener("click", () => showDetailModal(child.id));
                        tbody.appendChild(childRow);
                    });
                }
            });
        }

        // Update Pagination Controls
        if (elements.paginationInfo) {
            elements.paginationInfo.textContent = totalItems > 0 
                ? `กำลังแสดงรายการที่ ${startIndex + 1}-${endIndex} จากทั้งหมด ${formatNumber(totalItems)} รายการหลัก`
                : `กำลังแสดงรายการที่ 0-0 จากทั้งหมด 0 รายการหลัก`;
        }

        if (elements.btnPrev) elements.btnPrev.disabled = state.currentPage === 1;
        if (elements.btnNext) elements.btnNext.disabled = state.currentPage === totalPages || totalItems === 0;

        // Sync Sort headers direction
        updateSortHeaders();

        // Refresh charts dynamically based on filtered data!
        renderCharts();
    }

    function updateSortHeaders() {
        const headers = [
            { th: elements.thPriority, col: 'priority' },
            { th: elements.thType, col: 'type' },
            { th: elements.thName, col: 'name' },
            { th: elements.thFaculty, col: 'faculty' },
            { th: elements.thQty, col: 'quantity' },
            { th: elements.thPrice, col: 'unitPrice' },
            { th: elements.thTotal, col: 'totalPrice' },
            { th: elements.thRequester, col: 'requester' },
            { th: elements.thSpecMaker, col: 'specMaker' }
        ];

        headers.forEach(h => {
            if (h.th) {
                h.th.classList.remove('sorted-asc', 'sorted-desc');
                if (state.sortColumn === h.col) {
                    h.th.classList.add(state.sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
                }
            }
        });
    }

    // 10. Item Details Modal Handler (Handles both parent and child items seamlessly)
    function showDetailModal(itemId) {
        let item = state.items.find(i => i.id === itemId);
        
        // Search in child arrays if not found in parents
        if (!item) {
            for (const parent of state.items) {
                const child = parent.children.find(c => c.id === itemId);
                if (child) {
                    item = child;
                    break;
                }
            }
        }
        
        if (!item) return;

        // Set text fields
        if (elements.modalItemName) elements.modalItemName.textContent = item.name;
        if (elements.modalFaculty) elements.modalFaculty.textContent = item.faculty || "-";
        if (elements.modalDepartment) elements.modalDepartment.textContent = item.department || "-";
        if (elements.modalQty) elements.modalQty.textContent = `${item.quantity} ${item.unit}`;
        if (elements.modalTotalPrice) elements.modalTotalPrice.textContent = `${formatNumber(item.totalPrice)} ฿`;
        if (elements.modalLocation) elements.modalLocation.textContent = item.location || "-";
        if (elements.modalRequester) elements.modalRequester.textContent = item.requester || "-";
        if (elements.modalSpecMaker) elements.modalSpecMaker.textContent = item.specMaker || "-";
        if (elements.modalNeedType) elements.modalNeedType.textContent = item.needType || "-";
        if (elements.modalExistingStatus) elements.modalExistingStatus.textContent = `${item.existingStatus || "-"} ${item.existingQty ? `(${item.existingQty})` : ""}`;
        if (elements.modalNeedDetail) elements.modalNeedDetail.textContent = item.needDetail || "ไม่ได้ระบุคำอธิบายเพิ่มเติม";

        // Badges
        const isTech = item.type === 'science_tech';
        if (elements.modalBadgeType) {
            elements.modalBadgeType.className = isTech ? 'badge badge-tech' : 'badge badge-health';
            elements.modalBadgeType.textContent = isTech ? 'วิทยาศาสตร์และเทคโนโลยี' : 'วิทยาศาสตร์สุขภาพ';
        }

        // Render Quotes comparison
        const quotes = [];
        if (item.vendor1) quotes.push({ name: item.vendor1, price: item.price1 });
        if (item.vendor2) quotes.push({ name: item.vendor2, price: item.price2 });
        if (item.vendor3) quotes.push({ name: item.vendor3, price: item.price3 });

        if (elements.modalQuotesGrid) {
            elements.modalQuotesGrid.innerHTML = '';
            if (quotes.length === 0) {
                elements.modalQuotesGrid.innerHTML = `<div style="grid-column: 1/-1; color:var(--text-secondary); text-align:center; padding: 10px;">ไม่มีข้อมูลใบเสนอราคาเปรียบเทียบ</div>`;
            } else {
                // Find lowest price
                const validPrices = quotes.filter(q => q.price > 0);
                const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices.map(q => q.price)) : Infinity;

                quotes.forEach(q => {
                    const card = document.createElement("div");
                    const isLowest = q.price > 0 && q.price === lowestPrice;
                    card.className = `quote-card ${isLowest ? 'lowest' : ''}`;
                    
                    card.innerHTML = `
                        <div class="quote-vendor">${q.name}</div>
                        <div class="quote-price">
                            <span>${q.price > 0 ? `${formatNumber(q.price)} ฿` : "-"}</span>
                            ${isLowest ? '<span class="lowest-badge">ราคาต่ำสุด</span>' : ''}
                        </div>
                    `;
                    elements.modalQuotesGrid.appendChild(card);
                });
            }
        }

        // Quotation and image buttons
        if (elements.modalBtnQuote) {
            if (item.link) {
                elements.modalBtnQuote.href = item.link;
                elements.modalBtnQuote.style.display = 'flex';
            } else {
                elements.modalBtnQuote.style.display = 'none';
            }
        }

        if (elements.modalBtnImage) {
            if (item.image) {
                elements.modalBtnImage.href = item.image;
                elements.modalBtnImage.style.display = 'flex';
            } else {
                elements.modalBtnImage.style.display = 'none';
            }
        }

        // Open Modal
        if (elements.modalDetail) {
            elements.modalDetail.classList.add("active");
        }
    }

    function closeModal() {
        if (elements.modalDetail) {
            elements.modalDetail.classList.remove("active");
        }
    }

    // =========================================================================
    // GOOGLE SHEETS LIVE DATA PARSING & LOADER ENGINE
    // =========================================================================
    async function fetchSheetData(spreadsheetId, sheetName) {
        // Append unique timestamp to bypass browser cache
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const text = await res.text();
        
        // Parse Viz API output callback string securely
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        
        // Log raw data in developer console
        console.log(`[Google Sheets Raw Data] Sheet Tab Name: "${sheetName}"`, data);
        
        return data.table;
    }

    function cleanText(cell) {
        if (!cell || cell.v === null || cell.v === undefined) return "";
        return String(cell.v).trim();
    }

    function cleanNumber(cell) {
        if (!cell || cell.v === null || cell.v === undefined) return 0;
        const val = typeof cell.v === 'number' ? cell.v : parseFloat(String(cell.v).replace(/,/g, '').trim());
        return isNaN(val) ? 0 : val;
    }

    // Parse budget and clean commas before converting to float
    function parsePrice(cell) {
        if (!cell) return 0;
        const str = cell.f || String(cell.v !== null && cell.v !== undefined ? cell.v : "");
        const cleaned = str.replace(/,/g, '').trim();
        const val = parseFloat(cleaned);
        return isNaN(val) ? 0 : val;
    }

    function parseSheetTable(table, isTech) {
        const items = [];
        let currentParent = null;
        const rows = table.rows || [];
        
        // DYNAMIC START INDEX DETECTION (ค้นหาแถวเริ่มต้นของข้อมูลดิบรายการครุภัณฑ์)
        let startIndex = 0;
        for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (!r || !r.c) continue;
            const cells = r.c;
            
            const priority = cleanText(cells[0]);
            const name = cleanText(cells[3]);
            const qty = cleanNumber(cells[5]);
            
            const isNumeric = priority !== "" && !isNaN(parseFloat(priority)) && isFinite(priority);
            if (isNumeric && name && qty > 0) {
                startIndex = i;
                console.log(`[Google Sheets] Item data starts at Row ${startIndex + 1} for ${isTech ? 'Tech' : 'Health'}`);
                break;
            }
        }

        // Log column mappings for developer console auditing
        console.log(`[Google Sheets Mapping Info] Tab: "${isTech ? 'Tech' : 'Health'}" indices used:`, {
            priority: 0,
            agencyNo: 1,
            category: 2,
            name: 3,
            unit: 4,
            quantity: 5,
            unitPrice: 6,
            totalPrice: 7,
            requester: 19,
            specMaker: 20,
            department: 21,
            image: 22,
            faculty: 23,
            link: 24
        });

        for (let r = startIndex; r < rows.length; r++) {
            const row = rows[r];
            if (!row || !row.c) continue;

            const cells = row.c;
            const priority = cleanText(cells[0]); // Priority is Column A (index 0)
            const name = cleanText(cells[3]);     // Name is Column D (index 3)
            const qty = cleanNumber(cells[5]);     // Qty is Column F (index 5)

            // Skip rows without valid name or quantity
            if (!name || qty <= 0) continue;

            // G1: ดึงเฉพาะข้อมูลรายการครุภัณฑ์ (กรองเอาเฉพาะแถวที่เป็นครุภัณฑ์จริง ข้ามแถวตารางสรุป/ guidelines ทั้งหมด)
            const lowerName = name.toLowerCase();
            if (lowerName.includes("รวมทั้งหมด") || 
                lowerName.includes("หมายเหตุ") || 
                lowerName.includes("สำนักวิชา") || 
                lowerName.includes("ศูนย์เครื่องมือ") ||
                lowerName.includes("ตั้งงบรวมกัน") ||
                lowerName.includes("ข้อเสนอแนะ") ||
                lowerName.includes("ตารางสรุป") ||
                lowerName.includes("หน่วยงาน") ||
                lowerName.includes("คำขอตั้งงบประมาณ")) {
                continue;
            }

            // Fixed columns mappings
            const agencyNo = cleanText(cells[1]);
            const category = cleanText(cells[2]);
            const unit = cleanText(cells[4]);
            
            // G2: บวกเลขยอดรวมใหม่ด้วยโค้ด (ลบเครื่องหมาย Comma (,) ก่อนนำมาบวกเสมอ)
            const unitPrice = parsePrice(cells[6]);
            const totalPrice = parsePrice(cells[7]) || (qty * unitPrice);

            const existingStatus = cleanText(cells[8]);
            const existingQty = cleanText(cells[9]);
            const needType = cleanText(cells[10]);
            const needDetail = cleanText(cells[11]);
            const location = cleanText(cells[12]);
            const vendor1 = cleanText(cells[13]);
            const price1 = parsePrice(cells[14]);
            const vendor2 = cleanText(cells[15]);
            const price2 = parsePrice(cells[16]);
            const vendor3 = cleanText(cells[17]);
            const price3 = parsePrice(cells[18]);
            const requester = cleanText(cells[19]);

            // Trailing columns (indices 20 to 24) are identical in both sheets
            const specMaker = cleanText(cells[20]);
            const department = cleanText(cells[21]);
            const image = cleanText(cells[22]);
            const faculty = cleanText(cells[23]);
            const link = cleanText(cells[24]);

            // Parent Item: Priority (Col A) is a valid numeric value
            const isParent = priority !== "" && !isNaN(parseFloat(priority)) && isFinite(priority);

            if (isParent) {
                const parentObj = {
                    id: `${isTech ? 'tech' : 'health'}-${r + 1}`,
                    type: isTech ? "science_tech" : "science_health",
                    category_th: isTech ? "วิทยาศาสตร์และเทคโนโลยี" : "วิทยาศาสตร์สุขภาพ",
                    priority: priority,
                    agencyNo: agencyNo,
                    category: category,
                    name: name,
                    unit: unit,
                    quantity: qty,
                    unitPrice: unitPrice,
                    totalPrice: totalPrice,
                    existingStatus: existingStatus,
                    existingQty: existingQty,
                    needType: needType,
                    needDetail: needDetail,
                    location: location,
                    vendor1: vendor1,
                    price1: price1,
                    vendor2: vendor2,
                    price2: price2,
                    vendor3: vendor3,
                    price3: price3,
                    requester: requester,
                    specMaker: specMaker,
                    department: department,
                    image: image,
                    faculty: faculty,
                    link: link,
                    children: []
                };

                // Output logs for visual verification of mapped cells
                if (items.length < 2) {
                    console.log(`[Google Sheets Parse] Mapped Row ${r+1} -> Parent Name: "${parentObj.name}", Qty: ${parentObj.quantity}, Price: ${parentObj.totalPrice} Baht`);
                }

                currentParent = parentObj;
                items.push(parentObj);
            } else {
                // Child Item
                if (currentParent) {
                    let childUnitPrice = unitPrice;
                    if (childUnitPrice === 0) {
                        childUnitPrice = currentParent.unitPrice;
                    }
                    let childTotalPrice = totalPrice;
                    if (childTotalPrice === 0) {
                        childTotalPrice = qty * childUnitPrice;
                    }

                    const childObj = {
                        id: `${isTech ? 'tech' : 'health'}-${r + 1}`,
                        type: isTech ? "science_tech" : "science_health",
                        priority: priority,
                        agencyNo: agencyNo,
                        category: category,
                        name: name,
                        unit: unit,
                        quantity: qty,
                        unitPrice: childUnitPrice,
                        totalPrice: childTotalPrice,
                        existingStatus: existingStatus,
                        existingQty: existingQty,
                        needType: needType,
                        needDetail: needDetail,
                        location: location,
                        vendor1: vendor1,
                        price1: price1,
                        vendor2: vendor2,
                        price2: price2,
                        vendor3: vendor3,
                        price3: price3,
                        requester: requester,
                        specMaker: specMaker || currentParent.specMaker,
                        department: department,
                        image: image,
                        faculty: faculty,
                        link: link
                    };
                    
                    // Output logs for visual verification of mapped child cells
                    if (currentParent.children.length < 2) {
                        console.log(`[Google Sheets Parse] Mapped Row ${r+1} -> Child Name: "${childObj.name}", Qty: ${childObj.quantity}, Price: ${childObj.totalPrice} Baht`);
                    }

                    currentParent.children.push(childObj);
                }
            }
        }
        
        console.log(`[Google Sheets] Clean parsed items count for ${isTech ? 'Tech' : 'Health'}: ${items.length} main items`);
        return items;
    }

    async function loadDataset() {
        if (GOOGLE_SHEETS_CONFIG.enabled && GOOGLE_SHEETS_CONFIG.spreadsheetId) {
            try {
                console.log(`[Google Sheets] Starting load... SHEET_ID: ${GOOGLE_SHEETS_CONFIG.spreadsheetId}`);
                console.log(`[Google Sheets] Target tabs: "${GOOGLE_SHEETS_CONFIG.techSheetName}" and "${GOOGLE_SHEETS_CONFIG.healthSheetName}"`);
                
                // Add minor indicator in phase alert box
                if (elements.phaseAlertBox) {
                    elements.phaseAlertBox.innerHTML += `<div id="gs-loading-status" style="font-size:0.8rem; font-weight:600; color:var(--primary); margin-top:6px; animation: blink 1.2s infinite alternate;">🔄 กำลังเชื่อมต่อระบบและดึงข้อมูลสดจาก Google Sheets...</div>`;
                }
                
                const techTable = await fetchSheetData(GOOGLE_SHEETS_CONFIG.spreadsheetId, GOOGLE_SHEETS_CONFIG.techSheetName);
                console.log(`[Google Sheets] Tech Sheet loaded. Total rows: ${techTable.rows ? techTable.rows.length : 0}`);
                
                const healthTable = await fetchSheetData(GOOGLE_SHEETS_CONFIG.spreadsheetId, GOOGLE_SHEETS_CONFIG.healthSheetName);
                console.log(`[Google Sheets] Health Sheet loaded. Total rows: ${healthTable.rows ? healthTable.rows.length : 0}`);

                // Parse items for table view
                const techItems = parseSheetTable(techTable, true);
                const healthItems = parseSheetTable(healthTable, false);

                state.items = [...techItems, ...healthItems];
                console.log(`[Google Sheets] Total combined items parsed: ${state.items.length}`);
                
                // Clear loading status by rebuilding timeline
                initTimeline();
                
                // Append success logs to the UI for user visibility
                if (elements.phaseAlertBox) {
                    elements.phaseAlertBox.innerHTML += `<div style="font-size:0.8rem; font-weight:600; color:#2ec4b6; margin-top:4px;">✅ ดึงข้อมูลสดจาก Google Sheets สำเร็จ! (วิทย์-เทค: ${techItems.length} รายการ, วิทย์-สุข: ${healthItems.length} รายการ)</div>`;
                }
            } catch (err) {
                console.error("Google Sheets fetch failed! Falling back to data.js:", err);
                loadLocalFallback();
                initTimeline();
                if (elements.phaseAlertBox) {
                    elements.phaseAlertBox.innerHTML += `<div style="font-size:0.8rem; font-weight:600; color:var(--badge-health-text); margin-top:6px;">⚠️ การเชื่อมต่อ Google Sheets ล้มเหลว (กำลังแสดงข้อมูลแบบออฟไลน์สำรอง) <br><small>รายละเอียดข้อผิดพลาด: ${err.message}</small></div>`;
                }
            }
        } else {
            loadLocalFallback();
        }

        // Initialize state arrays, metrics, filter options and render elements
        state.filteredItems = [...state.items];
        updateKPIs();
        initFilterOptions();
        renderTable(); // Renders the table, which triggers chart updates
    }

    function loadLocalFallback() {
        const rawTech = BUDGET_DATA.science_tech || [];
        const rawHealth = BUDGET_DATA.science_health || [];
        state.items = [
            ...rawTech.map(item => ({ ...item, category_th: "วิทยาศาสตร์และเทคโนโลยี" })),
            ...rawHealth.map(item => ({ ...item, category_th: "วิทยาศาสตร์สุขภาพ" }))
        ];
    }

    // 11. Event Listeners wire-up
    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", () => {
            if (elements.body) {
                elements.body.classList.toggle("dark-theme");
                const isDark = elements.body.classList.contains("dark-theme");
                const thumb = elements.themeToggle.querySelector(".theme-switch-thumb");
                if (thumb) thumb.textContent = isDark ? "🌙" : "☀️";
            }
            // Re-render table (which also re-renders charts with updated colors)
            renderTable();
        });
    }

    // Modal Close
    if (elements.modalCloseBtn) {
        elements.modalCloseBtn.addEventListener("click", closeModal);
    }
    if (elements.modalDetail) {
        elements.modalDetail.addEventListener("click", (e) => {
            if (e.target === elements.modalDetail) closeModal();
        });
    }

    // Pagination
    if (elements.btnPrev) {
        elements.btnPrev.addEventListener("click", () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderTable();
            }
        });
    }

    if (elements.btnNext) {
        elements.btnNext.addEventListener("click", () => {
            const totalPages = Math.ceil(state.filteredItems.length / state.pageSize);
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderTable();
            }
        });
    }

    // Table sorting
    if (elements.thPriority) elements.thPriority.addEventListener("click", () => handleSort('priority'));
    if (elements.thType) elements.thType.addEventListener("click", () => handleSort('type'));
    if (elements.thName) elements.thName.addEventListener("click", () => handleSort('name'));
    if (elements.thFaculty) elements.thFaculty.addEventListener("click", () => handleSort('faculty'));
    if (elements.thQty) elements.thQty.addEventListener("click", () => handleSort('quantity'));
    if (elements.thPrice) elements.thPrice.addEventListener("click", () => handleSort('unitPrice'));
    if (elements.thTotal) elements.thTotal.addEventListener("click", () => handleSort('totalPrice'));
    if (elements.thRequester) elements.thRequester.addEventListener("click", () => handleSort('requester'));
    if (elements.thSpecMaker) {
        elements.thSpecMaker.addEventListener("click", () => handleSort('specMaker'));
    }

    // Filter changes
    if (elements.searchInput) {
        elements.searchInput.addEventListener("input", (e) => {
            state.filters.search = e.target.value;
            state.currentPage = 1;
            renderTable();
        });
    }

    if (elements.filterType) {
        elements.filterType.addEventListener("change", (e) => {
            state.filters.type = e.target.value;
            state.currentPage = 1;
            renderTable();
        });
    }

    if (elements.filterFaculty) {
        elements.filterFaculty.addEventListener("change", (e) => {
            state.filters.faculty = e.target.value;
            state.currentPage = 1;
            renderTable();
        });
    }

    // Clear filters (restores default list-load order)
    if (elements.btnClearFilters) {
        elements.btnClearFilters.addEventListener("click", () => {
            if (elements.searchInput) elements.searchInput.value = '';
            if (elements.filterType) elements.filterType.value = '';
            if (elements.filterFaculty) elements.filterFaculty.value = '';
            
            state.filters.search = '';
            state.filters.type = '';
            state.filters.faculty = '';
            
            state.sortColumn = null; // Return to original sheet order
            state.currentPage = 1;
            renderTable();
        });
    }

    // 12. Run Initialization
    initDateHeader();
    initTimeline();
    loadDataset(); // Dynamically pulls from Google Sheets or falls back to local data.js
});