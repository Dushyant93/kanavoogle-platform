import {Navigate, Route, Routes} from 'react-router-dom';
import {useAuth} from './auth/AuthContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AssessmentSetupPage from './pages/AssessmentSetupPage';
import AssessmentRunPage from './pages/AssessmentRunPage';
import AssessmentResultPage from './pages/AssessmentResultPage';
import SchoolDashboard from './pages/SchoolDashboard';
import EmployerDashboard from './pages/EmployerDashboard';

export default function App() {
    const {user} = useAuth();
    const home = user ? `/${user.role.toLowerCase()}` : '/';
    return <Routes><Route path="/" element={<LandingPage/>}/><Route path="/login"
                                                                    element={user ? <Navigate to={home}/> :
                                                                        <LoginPage/>}/><Route path="/register"
                                                                                              element={user ? <Navigate
                                                                                                      to={home}/> :
                                                                                                  <RegisterPage/>}/><Route
        element={<AppShell/>}><Route path="/student" element={<ProtectedRoute
        roles={['STUDENT']}><StudentDashboard/></ProtectedRoute>}/><Route path="/student/assessment/new"
                                                                          element={<ProtectedRoute
                                                                              roles={['STUDENT']}><AssessmentSetupPage/></ProtectedRoute>}/><Route
        path="/student/assessment/:id"
        element={<ProtectedRoute roles={['STUDENT']}><AssessmentRunPage/></ProtectedRoute>}/><Route
        path="/student/assessment/:id/result"
        element={<ProtectedRoute roles={['STUDENT']}><AssessmentResultPage/></ProtectedRoute>}/><Route path="/school"
                                                                                                       element={
                                                                                                           <ProtectedRoute
                                                                                                               roles={['SCHOOL']}><SchoolDashboard/></ProtectedRoute>}/><Route
        path="/employer"
        element={<ProtectedRoute roles={['EMPLOYER']}><EmployerDashboard/></ProtectedRoute>}/></Route><Route path="*"
                                                                                                             element={
                                                                                                                 <Navigate
                                                                                                                     to={home}/>}/></Routes>
}
