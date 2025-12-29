import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Typography,
  Snackbar,
  Alert,
  Fade,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  CardContent,
  CardHeader
} from '@mui/material';
import PageviewIcon from '@mui/icons-material/Pageview';
import PrintIcon from '@mui/icons-material/Print';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import MoodIcon from '@mui/icons-material/Mood';
import PsychologyIcon from '@mui/icons-material/Psychology';

// --- IMPORT API ---
import api from '../../../../services/api';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- Ubah jadi import bernama
// Komponen TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

// === KOMPONEN UTAMA ===
const HalamanRaporSiswa = () => {
  // === USER INFO ===
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  // === STATE FILTER ===
  const [selectedTahun, setSelectedTahun] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');

  // === STATE DATA MASTER ===
  const [kelasOptions, setKelasOptions] = useState([]);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  // === STATE DATA UTAMA ===
  const [studentList, setStudentList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [raporId, setRaporId] = useState(null);

  // === STATE EDIT SIKAP ===
  const [editMode, setEditMode] = useState({
    sikap: false
  });
  const [formSikap, setFormSikap] = useState({
    sikap_spiritual: '',
    sikap_sosial: ''
  });

  // === UI STATE ===
  const [loading, setLoading] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [catatan, setCatatan] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (currentUser?.role === 'Guru' && kelasOptions.length === 1 && !selectedKelas) {
      setSelectedKelas(kelasOptions[0].id);
    }
  }, [currentUser, kelasOptions, selectedKelas]);

  // === 1. FETCH DATA MASTER ===
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resKelas, resTahun, resSem] = await Promise.all([api.get('/kelas'), api.get('/tahun-ajaran'), api.get('/semester')]);

        // Kelas
        const dataKelas = resKelas.data?.data?.kelas || resKelas.data?.data || [];
        let processedKelasOptions = Array.isArray(dataKelas) ? dataKelas : [];

        // Filter Wali Kelas
        if (currentUser?.role === 'Guru' && currentUser?.pegawai?.id) {
          const myClass = processedKelasOptions.find((k) => String(k.wali_kelas_id) === String(currentUser.pegawai.id));
          if (myClass) {
            processedKelasOptions = [myClass];
            setSelectedKelas(myClass.id);
          }
        }
        setKelasOptions(processedKelasOptions);

        // Tahun Ajaran
        const dataTahun = resTahun.data?.data?.tahun_ajaran || resTahun.data?.data || [];
        setTahunOptions(Array.isArray(dataTahun) ? dataTahun : []);
        const activeTahun = Array.isArray(dataTahun) ? dataTahun.find((t) => t.status === 'Aktif') : null;
        if (activeTahun && !selectedTahun) setSelectedTahun(activeTahun.tahun);

        // Semester
        const dataSem = resSem.data?.data?.semester || resSem.data?.data || [];
        setSemesterOptions(Array.isArray(dataSem) ? dataSem : []);
        const activeSem = Array.isArray(dataSem) ? dataSem.find((s) => s.status === 'Aktif') : null;
        if (activeSem && !selectedSemester) setSelectedSemester(activeSem.id);
      } catch (error) {
        console.error('Error fetching master data:', error);
      }
    };

    if (currentUser) {
      fetchMasterData();
    }
  }, [currentUser]);

  // === 2. FETCH DAFTAR SISWA ===
  const handleTampilkanSiswa = async () => {
    if (!selectedKelas) {
      setSnackbar({ open: true, message: 'Silakan pilih kelas Anda.', severity: 'warning' });
      return;
    }
    setLoading(true);
    setReportData(null);
    setSelectedStudentId('');

    try {
      const response = await api.get('/siswa', { params: { kelas_id: selectedKelas, limit: 1000 } });
      const dataSiswa = response.data?.data?.siswa || [];

      setStudentList(
        Array.isArray(dataSiswa)
          ? dataSiswa.map((s) => ({
              id: s.id,
              nis: s.nis,
              nisn: s.nisn,
              nama: s.nama_lengkap || s.nama
            }))
          : []
      );

      setSnackbar({ open: true, message: `Daftar siswa dimuat.`, severity: 'success' });
    } catch (error) {
      console.error('Error fetching siswa:', error);
      setSnackbar({ open: true, message: 'Gagal memuat daftar siswa.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // === 3. FETCH DETAIL RAPOR SISWA ===
  const handleSelectStudent = async (studentId) => {
    setSelectedStudentId(studentId);
    setLoadingReport(true);
    setTabIndex(0);
    setEditMode({ sikap: false });

    try {
      // A. Ambil Rapor (Nilai Mapel, Ekskul, Sikap)
      const resRapor = await api.get('/rapor', {
        params: {
          siswa_id: studentId,
          semester_id: selectedSemester,
          limit: 1
        }
      });

      const responseData = resRapor.data?.data;
      let raporList = [];

      if (responseData?.rapor && Array.isArray(responseData.rapor)) {
        raporList = responseData.rapor;
      } else if (Array.isArray(responseData)) {
        raporList = responseData;
      } else if (responseData) {
        raporList = [responseData];
      }

      const raporRaw = raporList.length > 0 ? raporList[0] : null;

      // B. Ambil Absensi
      let sakit = 0,
        izin = 0,
        alpha = 0;
      try {
        const resAbsensi = await api.get('/absensi-harian', {
          params: {
            siswa_id: studentId,
            semester_id: selectedSemester,
            limit: 1000
          }
        });
        const absensiList = resAbsensi.data?.data?.absensi_harian || [];
        absensiList.forEach((a) => {
          if (a.status === 'S') sakit++;
          else if (a.status === 'I') izin++;
          else if (a.status === 'A') alpha++;
        });
      } catch (err) {
        console.warn('Gagal ambil data absensi harian', err);
      }

      // --- MAPPING DATA KE UI ---
      const studentInfo = studentList.find((s) => s.id === studentId);

      if (raporRaw) {
        setRaporId(raporRaw.id);
        setCatatan(raporRaw.catatan_wali_kelas || '');

        // Set form sikap dengan data dari API
        setFormSikap({
          sikap_spiritual: raporRaw.sikap_spiritual || '',
          sikap_sosial: raporRaw.sikap_sosial || ''
        });

        const nilaiList = raporRaw.nilai_mapel || raporRaw.nilai_rapor || [];

        setReportData({
          info: {
            nama: studentInfo?.nama,
            nis: studentInfo?.nis,
            nisn: studentInfo?.nisn
          },
          academic: nilaiList.map((nm) => ({
            id: nm.id,
            mapel: nm.mapel?.nama_mapel || nm.mata_pelajaran?.nama_mapel || 'Mapel Tidak Diketahui',
            nilai: nm.nilai_pengetahuan,
            predikat: nm.predikat_pengetahuan,
            deskripsi_pengetahuan: nm.deskripsi_pengetahuan || '-',
            nilai_k: nm.nilai_keterampilan,
            predikat_k: nm.predikat_keterampilan,
            deskripsi_keterampilan: nm.deskripsi_keterampilan || '-'
          })),
          nonAcademic: {
            attendance: { sakit, izin, alpha },
            extracurricular: (raporRaw.nilai_ekskul || raporRaw.nilai_ekskul_siswa || []).map((ne) => ({
              id: ne.id,
              nama: ne.ekskul?.nama_ekskul || 'Ekskul',
              nilai: ne.nilai,
              deskripsi: ne.deskripsi
            })),
            sikap: {
              sikap_spiritual: raporRaw.sikap_spiritual || '-',
              sikap_sosial: raporRaw.sikap_sosial || '-'
            }
          }
        });
      } else {
        // Jika Rapor Belum Ada
        setRaporId(null);
        setCatatan('');
        setFormSikap({
          sikap_spiritual: '',
          sikap_sosial: ''
        });
        setReportData({
          info: {
            nama: studentInfo?.nama,
            nis: studentInfo?.nis,
            nisn: studentInfo?.nisn
          },
          academic: [],
          nonAcademic: {
            attendance: { sakit, izin, alpha },
            extracurricular: [],
            sikap: {
              sikap_spiritual: '-',
              sikap_sosial: '-'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error fetching report details:', error);
      setSnackbar({ open: true, message: 'Gagal memuat detail rapor.', severity: 'error' });
    } finally {
      setLoadingReport(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  // === 4. HANDLE EDIT SIKAP ===
  const handleEditSikap = () => {
    setEditMode({ ...editMode, sikap: true });
  };

  const handleCancelEditSikap = () => {
    setEditMode({ ...editMode, sikap: false });
    // Reset form ke data asli
    if (reportData) {
      setFormSikap({
        sikap_spiritual: reportData.nonAcademic.sikap.sikap_spiritual || '',
        sikap_sosial: reportData.nonAcademic.sikap.sikap_sosial || ''
      });
    }
  };

  const handleSaveSikap = async () => {
    if (!raporId) {
      setSnackbar({ open: true, message: 'Rapor belum dibuat. Harap generate nilai terlebih dahulu.', severity: 'warning' });
      return;
    }

    try {
      await api.put(`/rapor/${raporId}`, {
        sikap_spiritual: formSikap.sikap_spiritual,
        sikap_sosial: formSikap.sikap_sosial
      });

      // Update local state
      setReportData((prev) => ({
        ...prev,
        nonAcademic: {
          ...prev.nonAcademic,
          sikap: {
            sikap_spiritual: formSikap.sikap_spiritual,
            sikap_sosial: formSikap.sikap_sosial
          }
        }
      }));
      setEditMode({ ...editMode, sikap: false });
      setSnackbar({ open: true, message: 'Data sikap berhasil disimpan.', severity: 'success' });
    } catch (error) {
      console.error('Error saving sikap:', error);
      setSnackbar({ open: true, message: 'Gagal menyimpan data sikap.', severity: 'error' });
    }
  };

  // === 5. SIMPAN CATATAN WALI KELAS ===
  const handleSimpanCatatan = async () => {
    if (!raporId) {
      setSnackbar({ open: true, message: 'Rapor belum dibuat. Harap generate nilai terlebih dahulu.', severity: 'warning' });
      return;
    }

    try {
      await api.put(`/rapor/${raporId}`, {
        catatan_wali_kelas: catatan
      });
      setSnackbar({ open: true, message: 'Catatan wali kelas berhasil disimpan.', severity: 'success' });
    } catch (error) {
      console.error('Error saving note:', error);
      setSnackbar({ open: true, message: 'Gagal menyimpan catatan.', severity: 'error' });
    }
  };



const handleCetakPDF = () => {
  if (!reportData) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;
  let currentY = 15;

  // --- 1. KOP SEKOLAH ---
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('PEMERINTAH KOTA PADANG', pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;
  doc.text('DINAS PENDIDIKAN', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;
  doc.setFontSize(16);
  doc.text('MADRASAH IBTIDAYYAH SWASTA NURUSH SHOLIHIN', pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;
  doc.setFont('times', 'normal');
  doc.setFontSize(10);
  doc.text('Alamat: Jl. Sungai Bangek, Kota Padang, Sumatera Barat', pageWidth / 2, currentY, { align: 'center' });
  
  // Garis Pemisah
  currentY += 4;
  doc.setLineWidth(1);
  doc.line(marginX, currentY, pageWidth - marginX, currentY); 
  doc.setLineWidth(0.5);
  doc.line(marginX, currentY + 1, pageWidth - marginX, currentY + 1); 

  // --- 2. IDENTITAS SISWA ---
  currentY += 10;
  doc.setFontSize(11);
  
  const namaKelas = kelasOptions.find(k => k.id === selectedKelas)?.nama_kelas || '-';
  const namaSemester = semesterOptions.find(s => s.id === selectedSemester)?.nama || 'Ganjil';

  const printIdentity = (label1, val1, label2, val2, y) => {
    doc.text(label1, marginX, y);
    doc.text(':', marginX + 35, y); 
    doc.text(val1, marginX + 38, y);
    if (label2) {
      const leftCol2 = 120;
      doc.text(label2, leftCol2, y);
      doc.text(':', leftCol2 + 30, y);
      doc.text(val2, leftCol2 + 33, y);
    }
  };

  printIdentity('Nama Peserta Didik', reportData.info.nama, 'Kelas', namaKelas, currentY);
  currentY += 6;
  printIdentity('NIS / NISN', `${reportData.info.nis} / ${reportData.info.nisn}`, 'Semester', namaSemester, currentY);
  currentY += 6;
  printIdentity('', '', 'Tahun Pelajaran', selectedTahun, currentY);

  // --- 3. SIKAP (TABLE) ---
  currentY += 12;
  doc.setFont('times', 'bold');
  doc.text('A. SIKAP', marginX, currentY);
  
  // PERBAIKAN: Gunakan autoTable(doc, options)
  autoTable(doc, {
    startY: currentY + 2,
    head: [['Sikap Spiritual', 'Sikap Sosial']],
    body: [[
      reportData.nonAcademic?.sikap?.sikap_spiritual || '-', 
      reportData.nonAcademic?.sikap?.sikap_sosial || '-'
    ]],
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0], font: 'times', fontStyle: 'bold', halign: 'center' },
    styles: { font: 'times', fontSize: 10, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
    margin: { left: marginX, right: marginX }
  });

  // --- 4. NILAI AKADEMIK (TABLE) ---
  // Kita ambil posisi Y terakhir dari tabel sebelumnya
  currentY = doc.lastAutoTable.finalY + 10; 
  doc.setFont('times', 'bold');
  doc.text('B. PENGETAHUAN DAN KETERAMPILAN', marginX, currentY);

  const academicData = reportData.academic.map((item, index) => [
    index + 1,
    item.mapel,
    item.nilai,
    item.predikat,
    item.deskripsi_pengetahuan || '-',
    item.nilai_k,
    item.predikat_k,
    item.deskripsi_keterampilan || '-'
  ]);

  // PERBAIKAN: Gunakan autoTable(doc, options)
  autoTable(doc, {
    startY: currentY + 3,
    head: [
      [
        { content: 'No', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'Mata Pelajaran', rowSpan: 2, styles: { valign: 'middle' } },
        { content: 'Pengetahuan', colSpan: 3, styles: { halign: 'center' } },
        { content: 'Keterampilan', colSpan: 3, styles: { halign: 'center' } },
      ],
      ['Nilai', 'Predikat', 'Deskripsi', 'Nilai', 'Predikat', 'Deskripsi']
    ],
    body: academicData,
    theme: 'grid',
    headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
    styles: { font: 'times', fontSize: 9, cellPadding: 2, lineColor: 0, lineWidth: 0.1 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      2: { halign: 'center', cellWidth: 10 },
      3: { halign: 'center', cellWidth: 10 },
      4: { cellWidth: 'auto' },
      5: { halign: 'center', cellWidth: 10 },
      6: { halign: 'center', cellWidth: 10 },
      7: { cellWidth: 'auto' }
    },
    margin: { left: marginX, right: marginX }
  });

  // --- 5. EKSTRAKURIKULER ---
  currentY = doc.lastAutoTable.finalY + 10;
  
  if (currentY > pageHeight - 40) {
     doc.addPage();
     currentY = 20;
  }

  doc.setFont('times', 'bold');
  doc.text('C. EKSTRAKURIKULER', marginX, currentY);

  const ekskulData = reportData.nonAcademic?.extracurricular?.map((ek, index) => [
    index + 1, ek.nama, ek.nilai, ek.deskripsi
  ]) || [];

  if (ekskulData.length === 0) ekskulData.push(['-', '-', '-', '-']);

  // PERBAIKAN: Gunakan autoTable(doc, options)
  autoTable(doc, {
    startY: currentY + 3,
    head: [['No', 'Kegiatan Ekstrakurikuler', 'Nilai', 'Keterangan']],
    body: ekskulData,
    theme: 'grid',
    headStyles: { fillColor: [230, 230, 230], textColor: 0, fontStyle: 'bold', lineWidth: 0.1, lineColor: 0 },
    styles: { font: 'times', fontSize: 10, lineColor: 0, lineWidth: 0.1 },
    columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 2: { halign: 'center', cellWidth: 15 } },
    margin: { left: marginX, right: marginX }
  });

  // --- 6. KETIDAKHADIRAN ---
  currentY = doc.lastAutoTable.finalY + 10;
  
  if (currentY > pageHeight - 50) {
      doc.addPage();
      currentY = 20;
  }

  doc.text('D. KETIDAKHADIRAN', marginX, currentY);
  
  const absensi = reportData.nonAcademic?.attendance || { sakit: 0, izin: 0, alpha: 0 };
  
  // PERBAIKAN: Gunakan autoTable(doc, options)
  autoTable(doc, {
    startY: currentY + 3,
    body: [
      ['Sakit', `${absensi.sakit} hari`],
      ['Izin', `${absensi.izin} hari`],
      ['Tanpa Keterangan', `${absensi.alpha} hari`],
    ],
    theme: 'grid',
    styles: { font: 'times', fontSize: 10, lineColor: 0, lineWidth: 0.1 },
    columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } },
    margin: { left: marginX }
  });

  // --- 7. CATATAN WALI KELAS ---
  currentY = doc.lastAutoTable.finalY + 10;
  
  if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = 20;
  }

  doc.setFont('times', 'bold');
  doc.text('E. CATATAN WALI KELAS', marginX, currentY);
  
  doc.setFont('times', 'normal');
  doc.rect(marginX, currentY + 3, pageWidth - (marginX * 2), 20); 
  doc.text(catatan || 'Tetap semangat belajar dan tingkatkan prestasimu.', marginX + 2, currentY + 8, { maxWidth: pageWidth - (marginX * 2) - 4 });

  // --- 8. TANDA TANGAN ---
  currentY = currentY + 35; 

  if (pageHeight - currentY < 60) {
      doc.addPage();
      currentY = 30;
  }

  const tanggalCetak = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  
  const leftSignX = marginX + 10;
  const centerSignX = pageWidth / 2;
  const rightSignX = pageWidth - marginX - 40;

  doc.setFontSize(10);
  
  doc.text(`Padang, ${tanggalCetak}`, rightSignX, currentY);
  doc.text('Wali Kelas,', rightSignX, currentY + 6);
  
  doc.text('Mengetahui,', leftSignX, currentY);
  doc.text('Orang Tua/Wali,', leftSignX, currentY + 6);

  currentY += 25;

  doc.text('( ..................................... )', leftSignX, currentY);
  doc.text(`( ${currentUser?.pegawai?.nama_lengkap || '.....................................'} )`, rightSignX, currentY);

  currentY += 10;
  doc.text('Mengetahui,', centerSignX, currentY, { align: 'center' });
  doc.text('Kepala Sekolah,', centerSignX, currentY + 6, { align: 'center' });
  
  currentY += 25;
  doc.text('( ..................................... )', centerSignX, currentY, { align: 'center' });
  doc.text('NIP. ...........................', centerSignX, currentY + 5, { align: 'center' });

  doc.save(`Rapor_${reportData.info.nama}_${namaSemester}.pdf`);
};

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // === RENDER ===
  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', p: { xs: 1, sm: 1.5, md: 2 } }}>
      {/* FILTER CARD */}
      <Card sx={{ mb: { xs: 1.5, sm: 2, md: 2 }, p: { xs: 2, sm: 1.5, md: 2 } }}>
        <Grid container spacing={{ xs: 1.5, sm: 1.5, md: 2 }} alignItems="center">
          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Tahun Ajaran</InputLabel>
              <Select value={selectedTahun} label="Tahun Ajaran" onChange={(e) => setSelectedTahun(e.target.value)}>
                {tahunOptions.map((t) => (
                  <MenuItem key={t.id} value={t.tahun}>
                    {t.tahun}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Semester</InputLabel>
              <Select value={selectedSemester} label="Semester" onChange={(e) => setSelectedSemester(e.target.value)}>
                {semesterOptions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nama}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            {currentUser?.role === 'Guru' && kelasOptions.length === 1 ? (
              <TextField
                label="Kelas Perwalian"
                size="small"
                fullWidth
                value={kelasOptions[0].nama_kelas}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiInputBase-input': { fontWeight: 'bold', color: 'primary.main' } }}
              />
            ) : (
              <FormControl fullWidth size="small">
                <InputLabel>Pilih Kelas</InputLabel>
                <Select value={selectedKelas} label="Pilih Kelas" onChange={(e) => setSelectedKelas(e.target.value)}>
                  {kelasOptions.map((k) => (
                    <MenuItem key={k.id} value={k.id}>
                      {k.nama_kelas}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Grid>

          <Grid size={{ xs: 6, sm: 6, md: 3 }}>
            <Button fullWidth variant="contained" startIcon={<PageviewIcon />} onClick={handleTampilkanSiswa} sx={{ minHeight: '40px' }}>
              {loading ? 'Memuat...' : 'Tampilkan'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* DATA TAMPILAN */}
      {studentList.length > 0 && (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {/* LIST SISWA */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600}>
                  Daftar Siswa ({studentList.length})
                </Typography>
              </Box>
              <List sx={{ maxHeight: 600, overflow: 'auto', p: 0 }}>
                {studentList.map((student) => (
                  <React.Fragment key={student.id}>
                    <ListItemButton selected={selectedStudentId === student.id} onClick={() => handleSelectStudent(student.id)}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: selectedStudentId === student.id ? 'primary.main' : 'grey.400' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={student.nama} secondary={`NIS: ${student.nis}`} />
                    </ListItemButton>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>

          {/* DETAIL RAPOR */}
          <Grid size={{ xs: 12, md: 8 }}>
            {loadingReport ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
              </Box>
            ) : reportData ? (
              <Fade in={true}>
                <Card>
                  {/* Header Rapor */}
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                        <PersonIcon fontSize="large" />
                      </Avatar>
                      <Box>
                        <Typography variant="h5" fontWeight={600}>
                          {reportData.info.nama}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          NIS: {reportData.info.nis} | NISN: {reportData.info.nisn}
                        </Typography>
                      </Box>
                    </Box>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={handleCetakPDF} disabled={!raporId}>
                      Cetak PDF
                    </Button>
                  </Box>

                  {/* Tabs */}
                  <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" aria-label="tabs rapor">
                      <Tab icon={<SchoolIcon />} iconPosition="start" label="Nilai Akademik" />
                      <Tab icon={<ChecklistIcon />} iconPosition="start" label="Non-Akademik" />
                    </Tabs>
                  </Box>

                  {/* --- TAB 1: NILAI AKADEMIK --- */}
                  <TabPanel value={tabIndex} index={0}>
                    {reportData.academic.length > 0 ? (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead sx={{ bgcolor: 'grey.100' }}>
                            <TableRow>
                              <TableCell>Mata Pelajaran</TableCell>
                              <TableCell align="center">Nilai (P)</TableCell>
                              <TableCell align="center">Predikat (P)</TableCell>
                              <TableCell>Deskripsi (P)</TableCell>
                              <TableCell align="center">Nilai (K)</TableCell>
                              <TableCell align="center">Predikat (K)</TableCell>
                              <TableCell>Deskripsi (K)</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {reportData.academic.map((n) => (
                              <TableRow key={n.id} hover>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                                  {n.mapel}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                  {n.nilai || '-'}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={n.predikat || '-'}
                                    size="small"
                                    color={n.predikat === 'A' ? 'success' : 'default'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.85rem' }}>
                                  {n.deskripsi_pengetahuan || '-'}
                                </TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600 }}>
                                  {n.nilai_k || '-'}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={n.predikat_k || '-'}
                                    size="small"
                                    color={n.predikat_k === 'A' ? 'success' : 'default'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.85rem' }}>
                                  {n.deskripsi_keterampilan || '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Alert severity="info">
                        Belum ada nilai akademik yang tersimpan di Rapor. Silakan "Simpan ke Rapor" dari menu Input Nilai.
                      </Alert>
                    )}
                  </TabPanel>

                  {/* --- TAB 2: NON-AKADEMIK --- */}
                  <TabPanel value={tabIndex} index={1}>
                    <Grid container spacing={3}>
                      {/* Bagian Absensi */}
                      <Grid size={{ xs: 12, sm: 12, md: 12 }}>
                        <Card variant="outlined">
                          <CardHeader title="Absensi (Semester Ini)" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }} />
                          <CardContent>
                            <Stack direction="row" spacing={2}>
                              <TextField
                                label="Sakit"
                                value={`${reportData.nonAcademic.attendance.sakit} hari`}
                                InputProps={{ readOnly: true }}
                                fullWidth
                              />
                              <TextField
                                label="Izin"
                                value={`${reportData.nonAcademic.attendance.izin} hari`}
                                InputProps={{ readOnly: true }}
                                fullWidth
                              />
                              <TextField
                                label="Alpha"
                                value={`${reportData.nonAcademic.attendance.alpha} hari`}
                                InputProps={{ readOnly: true }}
                                fullWidth
                              />
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Bagian Sikap */}
                      <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                          <CardHeader
                            title={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Sikap
                                </Typography>
                                {!editMode.sikap && (
                                  <Button startIcon={<EditIcon />} size="small" onClick={handleEditSikap} disabled={!raporId}>
                                    Edit
                                  </Button>
                                )}
                              </Box>
                            }
                          />
                          <CardContent>
                            {editMode.sikap ? (
                              <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                      <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      Sikap Spiritual
                                    </Typography>
                                    <TextField
                                      label="Deskripsi"
                                      multiline
                                      rows={3}
                                      fullWidth
                                      value={formSikap.sikap_spiritual}
                                      onChange={(e) => setFormSikap({ ...formSikap, sikap_spiritual: e.target.value })}
                                      placeholder="Deskripsi sikap spiritual..."
                                    />
                                  </Card>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                      <MoodIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      Sikap Sosial
                                    </Typography>
                                    <TextField
                                      label="Deskripsi"
                                      multiline
                                      rows={3}
                                      fullWidth
                                      value={formSikap.sikap_sosial}
                                      onChange={(e) => setFormSikap({ ...formSikap, sikap_sosial: e.target.value })}
                                      placeholder="Deskripsi sikap sosial..."
                                    />
                                  </Card>
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                    <Button variant="outlined" onClick={handleCancelEditSikap}>
                                      Batal
                                    </Button>
                                    <Button variant="contained" onClick={handleSaveSikap} startIcon={<SaveIcon />}>
                                      Simpan
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            ) : (
                              <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                      <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      Sikap Spiritual
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {reportData.nonAcademic.sikap.sikap_spiritual || 'Belum ada deskripsi'}
                                    </Typography>
                                  </Card>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <Card variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                      <MoodIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                      Sikap Sosial
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {reportData.nonAcademic.sikap.sikap_sosial || 'Belum ada deskripsi'}
                                    </Typography>
                                  </Card>
                                </Grid>
                              </Grid>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Bagian Ekstrakurikuler */}
                      <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                          <CardHeader title="Ekstrakurikuler" titleTypographyProps={{ variant: 'subtitle1', fontWeight: 'bold' }} />
                          <CardContent>
                            {reportData.nonAcademic.extracurricular.length > 0 ? (
                              <List dense sx={{ p: 0 }}>
                                {reportData.nonAcademic.extracurricular.map((eks) => (
                                  <ListItem key={eks.id} divider sx={{ px: 0, py: 1 }}>
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <Typography variant="body1" fontWeight="medium">
                                            {eks.nama}
                                          </Typography>
                                          <Chip label={`Nilai: ${eks.nilai}`} size="small" color="secondary" variant="outlined" />
                                        </Box>
                                      }
                                      secondary={eks.deskripsi || '-'}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                Tidak ada data ekstrakurikuler.
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Bagian Catatan Wali Kelas */}
                      <Grid size={{ xs: 12 }}>
                        <Card variant="outlined">
                          <CardHeader
                            title={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <NoteAltIcon sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" fontWeight="bold">
                                  Catatan Wali Kelas
                                </Typography>
                              </Box>
                            }
                          />
                          <CardContent>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              placeholder="Tuliskan catatan wali kelas..."
                              value={catatan}
                              onChange={(e) => setCatatan(e.target.value)}
                              disabled={!raporId}
                              helperText={!raporId ? 'Generate nilai terlebih dahulu.' : ''}
                            />
                            <Box sx={{ mt: 2, textAlign: 'right' }}>
                              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSimpanCatatan} disabled={!raporId}>
                                Simpan Catatan
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </TabPanel>
                </Card>
              </Fade>
            ) : (
              <Card sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Pilih siswa dari daftar untuk melihat pratinjau rapor.
                </Typography>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HalamanRaporSiswa;