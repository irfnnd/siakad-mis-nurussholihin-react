import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  Fade,
  TextField,
  InputAdornment,
  CircularProgress,
  Stack,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import PageviewIcon from '@mui/icons-material/Pageview';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import UploadIcon from '@mui/icons-material/Upload';
import PrintIcon from '@mui/icons-material/Print'; // Icon Print

// --- IMPORT API ---
import api from '../../../../services/api';

// --- IMPORT JSPDF ---
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // Import as default

// === HELPER FUNCTIONS ===
const getAverage = (arr) => {
  const valid = arr.filter((n) => typeof n === 'number' && !isNaN(n));
  return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
};

const getPredikat = (nilai) => {
  if (nilai >= 90) return 'A';
  if (nilai >= 80) return 'B';
  if (nilai >= 70) return 'C';
  return 'D';
};

const getDeskripsi = (predikat, aspek) => {
    const awalan = aspek === 'Pengetahuan' ? 'Memahami' : 'Terampil dalam';
    switch (predikat) {
        case 'A': return `Sangat baik dalam ${awalan} materi.`;
        case 'B': return `Baik dalam ${awalan} materi.`;
        case 'C': return `Cukup dalam ${awalan} materi.`;
        case 'D': return `Perlu bimbingan dalam ${awalan} materi.`;
        default: return '-';
    }
};

// === KOMPONEN UTAMA ===
const HalamanNilaiSiswa = () => {
  
  // === USER INFO ===
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  // === STATE UI ===
  const [tabValue, setTabValue] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // === STATE FILTER ===
  const [selectedTahun, setSelectedTahun] = useState('2024/2025');
  const [selectedSemester, setSelectedSemester] = useState('Ganjil');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState(''); 
  
  // === STATE DATA MASTER ===
  const [kelasOptions, setKelasOptions] = useState([]);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // === STATE DATA UTAMA ===
  const [pengajaranId, setPengajaranId] = useState(null);
  const [bobotId, setBobotId] = useState(null); 
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]); 
  const [grades, setGrades] = useState([]); 
  const [bobot, setBobot] = useState({ bobot_harian: 0, bobot_pts: 0, bobot_pas: 0 }); 

  // === STATE FORM TAMBAH ===
  const [newAssignmentName, setNewAssignmentName] = useState('');
  const [newAssignmentType, setNewAssignmentType] = useState('Harian');
  const [newAssignmentKategori, setNewAssignmentKategori] = useState('Pengetahuan');

  const totalBobot = (parseFloat(bobot.bobot_harian) || 0) + (parseFloat(bobot.bobot_pts) || 0) + (parseFloat(bobot.bobot_pas) || 0);
  const bobotError = totalBobot !== 100;

  // === 1. FETCH DATA MASTER ===
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [resMapel, resKelas, resTahun, resSem] = await Promise.all([
          api.get('/mata-pelajaran'),
          api.get('/kelas'),
          api.get('/tahun-ajaran'),
          api.get('/semester')
        ]);
        
        setMapelOptions(resMapel.data?.data?.mata_pelajaran || resMapel.data?.data || []);
        
        const dataKelas = resKelas.data?.data?.kelas || resKelas.data?.data || [];
        let processedKelasOptions = Array.isArray(dataKelas) ? dataKelas : [];
        
        if (currentUser?.role === 'Guru' && currentUser?.pegawai?.id) {
            const myClass = processedKelasOptions.find(k => String(k.wali_kelas_id) === String(currentUser.pegawai.id));
            if (myClass) {
                processedKelasOptions = [myClass];
                setSelectedKelas(myClass.id);
            }
        }
        setKelasOptions(processedKelasOptions);
        
        const tahunData = resTahun.data?.data?.tahun_ajaran || resTahun.data?.data || [];
        setTahunOptions(Array.isArray(tahunData) ? tahunData : []);
        const activeTahun = Array.isArray(tahunData) ? tahunData.find(t => t.status === 'Aktif') : null;
        if (activeTahun) setSelectedTahun(activeTahun.tahun); 

        const semData = resSem.data?.data?.semester || resSem.data?.data || [];
        setSemesterOptions(Array.isArray(semData) ? semData : []);
        const activeSem = Array.isArray(semData) ? semData.find(s => s.status === 'Aktif') : null;
        if (activeSem) setSelectedSemester(activeSem.id);

      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };
    if (currentUser) fetchOptions();
  }, [currentUser]);

  // === 2. HANDLE TAMPILKAN ===
  const handleTampilkan = async () => {
    if (!selectedKelas || !selectedMapel || !selectedSemester) {
      setSnackbar({ open: true, message: 'Harap lengkapi filter (Kelas, Mapel, Semester).', severity: 'warning' });
      return;
    }
    
    setLoading(true);
    setPengajaranId(null);
    setBobotId(null); 
    setStudents([]); 

    try {
      const resSiswa = await api.get('/siswa', { params: { kelas_id: selectedKelas, limit: 1000 } });
      const rawStudents = resSiswa.data?.data?.siswa || [];
      const studentList = Array.isArray(rawStudents) ? rawStudents : [];
      setStudents(studentList);

      if (studentList.length === 0) {
         setSnackbar({ open: true, message: 'Tidak ada siswa ditemukan di kelas ini.', severity: 'info' });
         setLoading(false);
         return; 
      }

      let currentPengajaran = null;
      try {
        const resPengajaran = await api.get('/pengajaran', {
            params: {
              kelas_id: selectedKelas,
              mapel_id: selectedMapel,
              semester_id: selectedSemester
            }
        });
        
        let pList = resPengajaran.data?.data?.pengajaran || resPengajaran.data?.data;
        if (Array.isArray(pList)) currentPengajaran = pList[0];

        if (!currentPengajaran) {
            let guruIdToAssign = null;
            if (currentUser?.role === 'Guru' && currentUser?.pegawai?.id) {
                guruIdToAssign = currentUser.pegawai.id;
            } else {
                const selectedKelasObj = kelasOptions.find(k => k.id === selectedKelas);
                if (selectedKelasObj?.wali_kelas_id) {
                    guruIdToAssign = selectedKelasObj.wali_kelas_id;
                }
            }

            if (guruIdToAssign) {
                const createRes = await api.post('/pengajaran', {
                    guru_id: guruIdToAssign,
                    mapel_id: selectedMapel,
                    kelas_id: selectedKelas,
                    semester_id: selectedSemester
                });
                currentPengajaran = createRes.data?.data;

                if (currentPengajaran?.id) {
                   await Promise.all([
                      api.post('/penilaian', { pengajaran_id: currentPengajaran.id, nama_penilaian: 'PTS', tipe: 'PTS', kategori: 'Pengetahuan' }),
                      api.post('/penilaian', { pengajaran_id: currentPengajaran.id, nama_penilaian: 'PAS', tipe: 'PAS', kategori: 'Pengetahuan' }),
                      api.post('/penilaian', { pengajaran_id: currentPengajaran.id, nama_penilaian: 'Praktik 1', tipe: 'Harian', kategori: 'Keterampilan' })
                   ]);
                }
                setSnackbar({ open: true, message: 'Data Pengajaran diinisialisasi.', severity: 'success' });
            } else {
                console.warn("Guru tidak terdeteksi");
            }
        }
      } catch (err) {
          console.error("Gagal init pengajaran:", err);
      }

      if (currentPengajaran) {
          const pId = currentPengajaran.id;
          setPengajaranId(pId);

          const [resPenilaian, resBobot, resNilai] = await Promise.allSettled([
            api.get('/penilaian', { params: { pengajaran_id: pId } }), 
            api.get('/konfigurasi-bobot', { params: { pengajaran_id: pId } }),
            api.get('/nilai', { params: { pengajaran_id: pId, limit: 1000 } })
          ]);

          if (resPenilaian.status === 'fulfilled') {
            const raw = resPenilaian.value.data?.data?.penilaian || resPenilaian.value.data?.data || [];
            setAssignments(Array.isArray(raw) ? raw : []);
          } else { setAssignments([]); }

          if (resBobot.status === 'fulfilled') {
            const raw = resBobot.value.data?.data?.konfigurasi_bobot || resBobot.value.data?.data;
            const bobotData = Array.isArray(raw) ? (raw[0] || {}) : (raw || {});
            
            if (bobotData.id) {
                setBobotId(bobotData.id);
            } else {
                setBobotId(null);
            }

            setBobot({
                bobot_harian: bobotData.bobot_harian || 0,
                bobot_pts: bobotData.bobot_pts || 0,
                bobot_pas: bobotData.bobot_pas || 0
            });
          }

          if (resNilai.status === 'fulfilled') {
            const raw = resNilai.value.data?.data?.nilai || [];
            setGrades(Array.isArray(raw) ? raw.map(g => ({
                studentId: String(g.siswa_id),
                assignmentId: String(g.penilaian_id),
                nilai: parseFloat(g.nilai)
            })) : []);
          } else { setGrades([]); }

      } else {
          setAssignments([]); setGrades([]);
          setSnackbar({ open: true, message: 'Data siswa dimuat (Mode Baca).', severity: 'info' });
      }

    } catch (error) {
      console.error("Critical error fetching data:", error);
      setSnackbar({ open: true, message: 'Terjadi kesalahan saat memuat data.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // === 3. SIMPAN BOBOT ===
  const handleSimpanBobot = async () => {
    if (bobotError) {
      setSnackbar({ open: true, message: 'Total bobot harus 100%.', severity: 'error' });
      return;
    }
    if (!pengajaranId) return;

    try {
      if (bobotId) {
        await api.put(`/konfigurasi-bobot/${bobotId}`, {
            bobot_harian: bobot.bobot_harian,
            bobot_pts: bobot.bobot_pts,
            bobot_pas: bobot.bobot_pas
        });
      } else {
        const response = await api.post('/konfigurasi-bobot', {
            pengajaran_id: pengajaranId,
            bobot_harian: bobot.bobot_harian,
            bobot_pts: bobot.bobot_pts,
            bobot_pas: bobot.bobot_pas
        });
        if (response.data?.data?.id) {
            setBobotId(response.data.data.id);
        }
      }
      setSnackbar({ open: true, message: `Bobot berhasil disimpan.`, severity: 'success' });
    } catch (error) {
      console.error("Error saving bobot:", error);
      const msg = error.response?.data?.message || 'Gagal menyimpan bobot.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // === 4. SIMPAN NILAI AKHIR KE RAPOR ===
  const handleSimpanKeRapor = async () => {
    if (!pengajaranId || students.length === 0) {
        setSnackbar({ open: true, message: 'Tidak ada data untuk disimpan.', severity: 'warning' });
        return;
    }
    
    setLoading(true);
    try {
        const dataToSave = students.map(s => {
            const pAssigns = assignments.filter(a => (!a.kategori || a.kategori === 'Pengetahuan'));
            const pIdsHarian = pAssigns.filter(a => a.tipe === 'Harian').map(a => a.id.toString());
            const pIdPTS = pAssigns.find(a => a.tipe === 'PTS')?.id.toString();
            const pIdPAS = pAssigns.find(a => a.tipe === 'PAS')?.id.toString();
            
            const getVal = (aid) => {
                const g = grades.find(gr => String(gr.studentId) === String(s.id) && String(gr.assignmentId) === String(aid));
                return g ? parseFloat(g.nilai) : 0;
            };

            const valsHarian = pIdsHarian.map(id => getVal(id));
            const avgHarian = getAverage(valsHarian);
            const valPTS = pIdPTS ? getVal(pIdPTS) : 0;
            const valPAS = pIdPAS ? getVal(pIdPAS) : 0;

            const nilaiP = (avgHarian * (bobot.bobot_harian || 0) / 100) + 
                           (valPTS * (bobot.bobot_pts || 0) / 100) + 
                           (valPAS * (bobot.bobot_pas || 0)) / 100;

            const kAssigns = assignments.filter(a => a.kategori === 'Keterampilan');
            const kIds = kAssigns.map(a => a.id.toString());
            const kVals = kIds.map(id => getVal(id));
            const nilaiK = getAverage(kVals);

            return {
                siswa_id: s.id,
                nilai_pengetahuan: Math.round(nilaiP),
                predikat_pengetahuan: getPredikat(Math.round(nilaiP)),
                deskripsi_pengetahuan: getDeskripsi(getPredikat(Math.round(nilaiP)), 'Pengetahuan'),
                nilai_keterampilan: Math.round(nilaiK),
                predikat_keterampilan: getPredikat(Math.round(nilaiK)),
                deskripsi_keterampilan: getDeskripsi(getPredikat(Math.round(nilaiK)), 'Keterampilan'),
            };
        });

        await api.post('/rapor/save-nilai-batch', {
            pengajaran_id: pengajaranId,
            kelas_id: selectedKelas,
            semester_id: selectedSemester,
            mapel_id: selectedMapel,
            data_nilai: dataToSave
        });

        setSnackbar({ open: true, message: 'Nilai Akhir berhasil dikirim ke Rapor!', severity: 'success' });

    } catch (error) {
        console.error("Error saving to rapor:", error);
        const msg = error.response?.data?.message || 'Gagal mengirim nilai ke Rapor.';
        setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
        setLoading(false);
    }
  };

  // === FUNGSI BARU: CETAK RAPOR PTS ===
  const handleCetakPTS = () => {
    if (students.length === 0) {
      setSnackbar({ open: true, message: 'Tidak ada data siswa untuk dicetak.', severity: 'warning' });
      return;
    }

    const doc = new jsPDF();
    const mapelName = mapelOptions.find(m => m.id === selectedMapel)?.nama_mapel || '-';
    const kelasName = kelasOptions.find(k => k.id === selectedKelas)?.nama_kelas || '-';
    // Gunakan fungsi .find untuk cari nama semester karena state selectedSemester mungkin ID
    const semesterName = semesterOptions.find(s => s.id === selectedSemester)?.nama || 'Ganjil';
    
    // --- KOP SEKOLAH ---
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('PEMERINTAH KABUPATEN [NAMA KABUPATEN]', 105, 15, { align: 'center' });
    doc.text('DINAS PENDIDIKAN', 105, 22, { align: 'center' });
    doc.setFontSize(16);
    doc.text('SD NEGERI CONTOH 01', 105, 30, { align: 'center' });
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text('Alamat: Jl. Pendidikan No. 123, Kota Padang, Sumatera Barat', 105, 36, { align: 'center' });
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    // --- JUDUL LAPORAN ---
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('DAFTAR NILAI PENILAIAN TENGAH SEMESTER (PTS)', 105, 50, { align: 'center' });
    
    // --- INFO KELAS ---
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text(`Mata Pelajaran : ${mapelName}`, 20, 60);
    doc.text(`Kelas              : ${kelasName}`, 20, 66);
    doc.text(`Semester         : ${semesterName}`, 130, 60);
    doc.text(`Tahun Ajaran   : ${selectedTahun}`, 130, 66);

    // --- PERSIAPAN DATA TABEL ---
    const tableBody = students.map((s, index) => {
        // Filter nilai pengetahuan
        const pAssigns = assignments.filter(a => (!a.kategori || a.kategori === 'Pengetahuan'));
        const pIdsHarian = pAssigns.filter(a => a.tipe === 'Harian').map(a => a.id.toString());
        const pIdPTS = pAssigns.find(a => a.tipe === 'PTS')?.id.toString();

        // Ambil nilai
        const getVal = (aid) => {
            const g = grades.find(gr => String(gr.studentId) === String(s.id) && String(gr.assignmentId) === String(aid));
            return g ? parseFloat(g.nilai) : 0;
        };

        const valsHarian = pIdsHarian.map(id => getVal(id));
        const avgHarian = getAverage(valsHarian);
        const valPTS = pIdPTS ? getVal(pIdPTS) : 0;
        
        // Rumus Nilai Akhir PTS (Disini kita pakai rata-rata sederhana (PH + PTS) / 2)
        const naPTS = Math.round((avgHarian + valPTS) / 2);

        return [
            index + 1,
            s.nis || '-',
            s.nama || s.nama_lengkap,
            Math.round(avgHarian),
            valPTS,
            naPTS,
            getPredikat(naPTS)
        ];
    });

    // --- TABEL ---
    autoTable(doc, {
        startY: 75,
        head: [['No', 'NIS', 'Nama Siswa', 'Rata-rata PH', 'Nilai PTS', 'NA PTS', 'Predikat']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold', halign: 'center', valign: 'middle' },
        styles: { font: 'times', fontSize: 10, valign: 'middle' },
        columnStyles: {
            0: { halign: 'center', cellWidth: 10 },
            1: { halign: 'center', cellWidth: 25 },
            3: { halign: 'center', cellWidth: 25 },
            4: { halign: 'center', cellWidth: 20 },
            5: { halign: 'center', cellWidth: 20 },
            6: { halign: 'center', cellWidth: 20 },
        }
    });

    // --- TANDA TANGAN ---
    const finalY = doc.lastAutoTable.finalY + 20;
    const tanggalCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    
    // Cek halaman
    if (finalY > 250) doc.addPage();

    doc.text(`Padang, ${tanggalCetak}`, 140, finalY);
    doc.text('Guru Mata Pelajaran,', 140, finalY + 7);
    doc.text(`( ${currentUser?.pegawai?.nama_lengkap || '.........................'} )`, 140, finalY + 35);
    doc.text(`NIP. ${currentUser?.pegawai?.nip || '.........................'}`, 140, finalY + 41);

    doc.save(`Nilai_PTS_${mapelName}_${kelasName}.pdf`);
  };

  // === 5. TAMBAH PENILAIAN ===
  const handleOpenAddDialog = () => setOpenAddDialog(true);
  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleSaveNewAssignment = async () => {
    if (!newAssignmentName.trim() || !pengajaranId) return;

    try {
      const response = await api.post('/penilaian', {
        pengajaran_id: pengajaranId,
        nama_penilaian: newAssignmentName,
        tipe: newAssignmentType,
        kategori: newAssignmentKategori 
      });

      const newAssign = response.data?.data; 
      if (newAssign) {
          const mappedAssign = {
             id: String(newAssign.id),
             nama_penilaian: newAssign.nama_penilaian,
             nama: newAssign.nama_penilaian, 
             tipe: newAssign.tipe,
             kategori: newAssign.kategori
          };
          setAssignments((prev) => [...prev, mappedAssign]);
          setSnackbar({ open: true, message: `Kolom '${newAssignmentName}' ditambahkan.`, severity: 'success' });
      }
      
      setNewAssignmentName('');
      setOpenAddDialog(false);

    } catch (error) {
      console.error("Error adding assignment:", error);
      setSnackbar({ open: true, message: 'Gagal menambah penilaian.', severity: 'error' });
    }
  };

  // === 6. EDIT NILAI ===
  const processRowUpdate = async (newRow, oldRow) => {
    for (const assign of assignments) {
      const fieldId = assign.id.toString(); 
      let newValue = parseFloat(newRow[fieldId]);
      const oldValue = parseFloat(oldRow[fieldId]);

      if (isNaN(newValue)) newValue = null;
      if (newValue < 0 || newValue > 100) newValue = null;

      if (newValue !== oldValue && (newValue !== null || oldValue !== null)) { 
        try {
          await api.post('/nilai', {
             siswa_id: newRow.id,
             penilaian_id: assign.id, 
             nilai: newValue
          });

          setGrades((prev) => {
            const idx = prev.findIndex((g) => String(g.studentId) === String(newRow.id) && String(g.assignmentId) === String(assign.id));
            if (idx > -1) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], nilai: newValue };
              return updated;
            } else if (newValue !== null) {
              return [...prev, { studentId: String(newRow.id), assignmentId: String(assign.id), nilai: newValue }];
            }
            return prev;
          });

        } catch (error) {
          console.error("Error saving grade:", error);
          setSnackbar({ open: true, message: 'Gagal menyimpan nilai.', severity: 'error' });
          return oldRow;
        }
      }
    }
    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    console.error(error);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // === COLUMNS GENERATOR ===
  const getColumns = (tab) => {
      const staticCols = [
        { field: 'nis', headerName: 'NIS', width: 100, frozen: true },
        { 
          field: 'nama', headerName: 'Nama Siswa', flex: 1, minWidth: 200, frozen: true,
          valueGetter: (value, row) => {
              const rowData = row || value?.row || value;
              return rowData?.nama_lengkap || rowData?.nama || '-';
          }
        }
      ];

      if (tab === 0) {
         const harianAssigns = assignments.filter(a => a.tipe === 'Harian');
         const dynamicCols = harianAssigns.map((a) => ({
            field: a.id.toString(),
            headerName: `${a.nama_penilaian} (${a.kategori === 'Keterampilan' ? 'K' : 'P'})`,
            width: 140,
            type: 'number',
            editable: true,
            cellClassName: a.kategori === 'Keterampilan' ? 'keterampilan-cell' : 'daily-cell'
         }));
         return [...staticCols, ...dynamicCols];
      }

      const kategori = tab === 1 ? 'Pengetahuan' : 'Keterampilan';
      
      const relevantAssigns = assignments.filter(a => (!a.kategori || a.kategori === kategori));

      const colRataHarian = {
         field: `rataHarian_${kategori}`,
         headerName: 'Rata-rata Harian',
         width: 130,
         type: 'number',
         cellClassName: 'calculated-cell',
         valueGetter: (value, row) => {
             const r = row || value?.row;
             if(!r) return 0;
             const harianIds = relevantAssigns.filter(a => a.tipe === 'Harian').map(a => a.id.toString());
             const vals = harianIds.map(id => r[id]);
             return Math.round(getAverage(vals));
         }
      };

      const examCols = relevantAssigns.filter(a => a.tipe === 'PTS' || a.tipe === 'PAS').map(a => ({
          field: a.id.toString(),
          headerName: a.tipe,
          width: 100,
          type: 'number',
          editable: true,
          cellClassName: 'exam-cell'
      }));

      const colNA = {
          field: `na_${kategori}`,
          headerName: 'Nilai Akhir',
          width: 120,
          type: 'number',
          cellClassName: 'final-grade',
          valueGetter: (value, row) => {
             const r = row || value?.row;
             if(!r) return 0;
             
             const harianIds = relevantAssigns.filter(a => a.tipe === 'Harian').map(a => a.id.toString());
             const avgHarian = getAverage(harianIds.map(id => r[id]));
             
             if (kategori === 'Pengetahuan') {
                 const ptsId = relevantAssigns.find(a => a.tipe === 'PTS')?.id.toString();
                 const pasId = relevantAssigns.find(a => a.tipe === 'PAS')?.id.toString();
                 const nPTS = ptsId ? (r[ptsId] || 0) : 0;
                 const nPAS = pasId ? (r[pasId] || 0) : 0;
                 const final = (avgHarian * (bobot.bobot_harian || 0) / 100) + 
                               (nPTS * (bobot.bobot_pts || 0) / 100) + 
                               (nPAS * (bobot.bobot_pas || 0) / 100);
                 return Math.round(final);
             } else {
                 const allIds = relevantAssigns.map(a => a.id.toString());
                 const allValues = allIds.map(id => r[id]);
                 return Math.round(getAverage(allValues));
             }
          }
      };

      const colPredikat = {
          field: `predikat_${kategori}`,
          headerName: 'Predikat',
          width: 90,
          cellClassName: 'calculated-cell',
          valueGetter: (value, row) => {
             const r = row || value?.row;
             if(!r) return '-';
             let final = 0;
             const harianIds = relevantAssigns.filter(a => a.tipe === 'Harian').map(a => a.id.toString());
             const avgHarian = getAverage(harianIds.map(id => r[id]));

             if (kategori === 'Pengetahuan') {
                 const ptsId = relevantAssigns.find(a => a.tipe === 'PTS')?.id.toString();
                 const pasId = relevantAssigns.find(a => a.tipe === 'PAS')?.id.toString();
                 const nPTS = ptsId ? (r[ptsId] || 0) : 0;
                 const nPAS = pasId ? (r[pasId] || 0) : 0;
                 final = (avgHarian * (bobot.bobot_harian || 0) / 100) + (nPTS * (bobot.bobot_pts || 0) / 100) + (nPAS * (bobot.bobot_pas || 0) / 100);
             } else {
                 const allIds = relevantAssigns.map(a => a.id.toString());
                 const allValues = allIds.map(id => r[id]);
                 final = getAverage(allValues);
             }
             return getPredikat(Math.round(final));
          },
          renderCell: (params) => (
             <Chip label={params.value} size="small" color={params.value === 'A' || params.value === 'B' ? 'success' : 'warning'} />
        )
      };

      const colDeskripsi = {
          field: `deskripsi_${kategori}`,
          headerName: 'Deskripsi',
          flex: 1,
          minWidth: 200,
          valueGetter: (value, row) => {
             const r = row || value?.row;
             if(!r) return '-';
             let final = 0;
             const harianIds = relevantAssigns.filter(a => a.tipe === 'Harian').map(a => a.id.toString());
             const avgHarian = getAverage(harianIds.map(id => r[id]));

             if (kategori === 'Pengetahuan') {
                 const ptsId = relevantAssigns.find(a => a.tipe === 'PTS')?.id.toString();
                 const pasId = relevantAssigns.find(a => a.tipe === 'PAS')?.id.toString();
                 const nPTS = ptsId ? (r[ptsId] || 0) : 0;
                 const nPAS = pasId ? (r[pasId] || 0) : 0;
                 final = (avgHarian * (bobot.bobot_harian || 0) / 100) + (nPTS * (bobot.bobot_pts || 0) / 100) + (nPAS * (bobot.bobot_pas || 0) / 100);
             } else {
                 const allIds = relevantAssigns.map(a => a.id.toString());
                 const allValues = allIds.map(id => r[id]);
                 final = getAverage(allValues);
             }
             const pred = getPredikat(Math.round(final));
             return getDeskripsi(pred, kategori);
          }
      };

      if (kategori === 'Keterampilan') {
          return [...staticCols, colNA, colPredikat, colDeskripsi];
      }

      return [...staticCols, colRataHarian, ...examCols, colNA, colPredikat, colDeskripsi];
  };

  const columns = useMemo(() => getColumns(tabValue), [assignments, bobot, students, tabValue]);

  const rows = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    return students.map((s) => {
      const row = { id: s.id, nis: s.nis, nama: s.nama || s.nama_lengkap };
      if (Array.isArray(assignments)) {
        assignments.forEach((a) => {
          const g = grades.find((gr) => String(gr.studentId) === String(s.id) && String(gr.assignmentId) === String(a.id));
          row[a.id.toString()] = g ? parseFloat(g.nilai) : null; 
        });
      }
      return row;
    });
  }, [students, assignments, grades]);

  // === RENDER ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 2, md: 3 } }}>
      
      {/* HEADER & FILTER */}
      <Card sx={{ mb: 1, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid sx={{xs: 6, sm: 3}}>
            <FormControl fullWidth size="small">
              <InputLabel>Tahun Ajaran</InputLabel>
              <Select value={selectedTahun} onChange={(e) => setSelectedTahun(e.target.value)} label="Tahun Ajaran">
                 {tahunOptions.map(t => <MenuItem key={t.id} value={t.tahun}>{t.tahun}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{xs: 6, sm: 3}}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester</InputLabel>
              <Select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} label="Semester">
                 {semesterOptions.map(s => <MenuItem key={s.id} value={s.id}>{s.nama}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{xs: 6, sm: 3}}>
            <FormControl fullWidth size="small">
                <InputLabel>Pilih Kelas</InputLabel>
                <Select value={selectedKelas} label="Pilih Kelas" onChange={(e) => setSelectedKelas(e.target.value)}>
                    {kelasOptions.map((k) => <MenuItem key={k.id} value={k.id}>{k.nama_kelas}</MenuItem>)}
                </Select>
            </FormControl>
          </Grid>
          <Grid sx={{xs: 6, sm: 3}}>
            <FormControl fullWidth size="small">
              <InputLabel>Mata Pelajaran</InputLabel>
              <Select value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)} label="Mata Pelajaran">
                {mapelOptions.map((m) => <MenuItem key={m.id} value={m.id}>{m.nama_mapel}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid sx={{xs: 12, sm: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkan} disabled={loading}>
              {loading ? '...' : 'Tampilkan'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* KONTEN UTAMA */}
      {pengajaranId && (
        <Fade in>
          <Box>
            {/* TABS */}
            <Card sx={{ mb: 2 }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} indicatorColor="primary" textColor="primary" variant="fullWidth">
                    <Tab icon={<AssignmentIcon />} label="Nilai Harian" iconPosition="start" />
                    <Tab icon={<AssessmentIcon />} label="Pengetahuan (KI-3)" iconPosition="start" />
                    <Tab icon={<SchoolIcon />} label="Keterampilan (KI-4)" iconPosition="start" />
                </Tabs>
            </Card>

            {/* CONFIG BOBOT (Hanya di Tab Pengetahuan) */}
            {tabValue === 1 && (
                <Card sx={{ mb: 1, p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Konfigurasi Bobot (Pengetahuan)
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                            <TextField label="Harian %" type="number" size="small" fullWidth value={bobot.bobot_harian} onChange={(e) => setBobot({...bobot, bobot_harian: e.target.value})} />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField label="PTS %" type="number" size="small" fullWidth value={bobot.bobot_pts} onChange={(e) => setBobot({...bobot, bobot_pts: e.target.value})} />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField label="PAS %" type="number" size="small" fullWidth value={bobot.bobot_pas} onChange={(e) => setBobot({...bobot, bobot_pas: e.target.value})} />
                        </Grid>
                        <Grid item xs={2}>
                             <Button variant="contained" size="small" onClick={handleSimpanBobot} disabled={bobotError}>Simpan</Button>
                        </Grid>
                        <Grid item xs={4}>
                             <Typography color={bobotError ? 'error' : 'success'} variant="caption">Total: {totalBobot}% {bobotError && '(Wajib 100%)'}</Typography>
                        </Grid>
                    </Grid>
                </Card>
            )}

            {/* TABEL DATA */}
            <Card>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">
                    {tabValue === 0 ? 'Input Nilai Harian' : (tabValue === 1 ? 'Rekap Pengetahuan' : 'Rekap Keterampilan')}
                </Typography>
                <Box>
                    {/* --- TOMBOL CETAK PTS BARU --- */}
                    {tabValue === 1 && (
                        <Button 
                            variant="outlined" 
                            color="secondary" 
                            startIcon={<PrintIcon />} 
                            onClick={handleCetakPTS} 
                            sx={{ mr: 2 }}
                        >
                            Cetak Rapor PTS
                        </Button>
                    )}

                    {/* Tombol Simpan ke Rapor (Baru) */}
                    <Button variant="contained" color="success" startIcon={<UploadIcon />} onClick={handleSimpanKeRapor} sx={{ mr: 2 }}>
                        Simpan ke Rapor
                    </Button>

                    {/* Tombol Tambah hanya di Tab Harian */}
                    {tabValue === 0 && (
                        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setOpenAddDialog(true)}>
                        Tambah Penilaian
                        </Button>
                    )}
                </Box>
              </Box>

              <Box sx={{ p: 2 }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  loading={loading}
                  autoHeight
                  disableRowSelectionOnClick
                  processRowUpdate={processRowUpdate}
                  onProcessRowUpdateError={(error) => console.error(error)}
                  sx={{
                    '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f5f5', fontWeight: 'bold' },
                    '& .calculated-cell': { bgcolor: '#fafafa' },
                    '& .final-grade': { bgcolor: '#e3f2fd', fontWeight: 'bold' },
                    '& .keterampilan-cell': { bgcolor: '#fff3e0' },
                  }}
                  components={{
                    NoRowsOverlay: () => <Stack height="100%" alignItems="center" justifyContent="center">Tidak ada data</Stack>
                  }}
                />
              </Box>
            </Card>
          </Box>
        </Fade>
      )}

      {/* DIALOG TAMBAH PENILAIAN */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>Tambah Kolom Nilai</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField fullWidth label="Nama Penilaian" value={newAssignmentName} onChange={(e) => setNewAssignmentName(e.target.value)} />
            <FormControl fullWidth>
                <InputLabel>Aspek</InputLabel>
                <Select value={newAssignmentKategori} label="Aspek" onChange={(e) => setNewAssignmentKategori(e.target.value)}>
                    <MenuItem value="Pengetahuan">Pengetahuan (KI-3)</MenuItem>
                    <MenuItem value="Keterampilan">Keterampilan (KI-4)</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth>
                <InputLabel>Tipe</InputLabel>
                <Select value={newAssignmentType} label="Tipe" onChange={(e) => setNewAssignmentType(e.target.value)}>
                    <MenuItem value="Harian">Harian</MenuItem>
                    <MenuItem value="PTS">PTS</MenuItem>
                    <MenuItem value="PAS">PAS</MenuItem>
                </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Batal</Button>
          <Button onClick={handleSaveNewAssignment} variant="contained">Simpan</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default HalamanNilaiSiswa;