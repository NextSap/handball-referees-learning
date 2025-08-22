"use client";

import React from 'react';
import {
    CompetitionEnum,
    Exam,
    Referee,
    RefereeCreate,
    RefereeSchema,
    RoleEnum
} from "@/prisma/schema";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {createReferee} from "@/prisma/actions/referee/create-referee";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {modifyReferee} from "@/prisma/actions/referee/modify-referee";
import {useRouter} from "next/navigation";
import {deleteReferee} from "@/prisma/actions/referee/delete-referee";
import {createRefereeExam} from "@/prisma/actions/referee-exam/create-referee-exam";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {useToast} from "@/hooks/use-toast";
import {ToastAction} from "@/components/ui/toast";
import {Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue} from "@/components/ui/select";

type RefereeComponentProps = {
    referees: Referee[],
    exams: Exam[]
}

const RefereeComponent = (props: RefereeComponentProps) => {
    const router = useRouter();
    const {toast} = useToast();

    const [currentReferee, setCurrentReferee] = React.useState<Referee>({
        // id is set to -1 to indicate a new referee
        id: -1,
        lastName: "",
        firstName: "a",
        email: "a",
        role: "referee",
        competition: "national"
    });

    const [dialog, setDialog] = React.useState<"create" | "modify">("create");
    const [nameFilter, setNameFilter] = React.useState<string>("");
    const [roleFilter, setRoleFilter] = React.useState<"none" | "referee" | "delegate" | "coach">("none");
    const [competitionFilter, setCompetitionFilter] = React.useState<"none" | "elite" | "national" | "league" | "regional">("none");

    return (
        <Dialog>
            <div className="flex flex-col gap-5 p-5">
                <header className="flex items-center justify-between w-full p-5 border-b shadow-lg">
                    <h1 className="text-3xl">Dashboard - Referees</h1>
                    <nav>
                        <ul className="flex gap-5">
                            <li>
                                <a className="cursor-pointer" onClick={() => router.push("/dashboard/exam")}>Exams</a>
                            </li>
                            <li>
                                <a className="underline cursor-pointer">Referees</a>
                            </li>
                        </ul>
                    </nav>
                </header>
                <DialogTrigger asChild onClick={() => {
                    setDialog("create");
                    setCurrentReferee({
                        id: -1,
                        lastName: "",
                        firstName: "",
                        email: "",
                        role: "referee",
                        competition: "national"
                    })
                }}>
                    <Button>Add new referee</Button>
                </DialogTrigger>
                <div className="flex gap-3">
                    <div className="w-36">
                        <Label htmlFor="nameFilter" className="ml-1">Filter by name</Label>
                        <Input id="nameFilter" placeholder="Filter by name" value={nameFilter}
                               onChange={(event) => setNameFilter(event.target.value)}/>
                    </div>
                    <div className="w-36">
                        <Label htmlFor="roleFilter" className="ml-1">Filter by role</Label>
                        <Select defaultValue={roleFilter} onValueChange={(value) => {
                            console.log(value);
                            setRoleFilter(value as "none" | "referee" | "delegate" | "coach");
                        }}>
                            <SelectTrigger>
                                <SelectValue id={"roleFilter"} defaultValue="none" placeholder="Role"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">All</SelectItem>
                                <SelectSeparator/>
                                <SelectItem value="coach">Coach</SelectItem>
                                <SelectItem value="delegate">Delegate</SelectItem>
                                <SelectItem value="referee">Referee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-36">
                        <Label htmlFor="competitionFilter" className="ml-1">Filter by competition</Label>
                        <Select defaultValue={competitionFilter} onValueChange={(value) => {
                            console.log(value);
                            setCompetitionFilter(value as "none" | "elite" | "national" | "league" | "regional");
                        }}>
                            <SelectTrigger>
                                <SelectValue id={"competitionFilter"} placeholder="Competition"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">All</SelectItem>
                                <SelectSeparator/>
                                <SelectItem value="elite">Elite</SelectItem>
                                <SelectItem value="national">National</SelectItem>
                                <SelectItem value="league">League</SelectItem>
                                <SelectItem value="regional">Regional</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Competition</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {props.referees.filter(referee => {
                            return (referee.lastName.toLowerCase().includes(nameFilter.toLowerCase())
                                    || referee.firstName.toLowerCase().includes(nameFilter.toLowerCase()))
                                && (referee.role.toLowerCase() == roleFilter.toLowerCase() || roleFilter == "none")
                                && (referee.competition.toLowerCase() == competitionFilter.toLowerCase() || competitionFilter == "none");
                        }).map(referee => {
                            return (
                                <TableRow key={referee.email}>
                                    <TableCell>{referee.lastName.toUpperCase() + " " + referee.firstName}</TableCell>
                                    <TableCell>{referee.email}</TableCell>
                                    <TableCell>{referee.role.toUpperCase()}</TableCell>
                                    <TableCell>{referee.competition.toUpperCase()}</TableCell>
                                    <TableCell className="flex gap-3">
                                        <DialogTrigger asChild
                                                       onClick={() => {
                                                           setDialog("modify");
                                                           setCurrentReferee({
                                                               id: referee.id,
                                                               lastName: referee.lastName,
                                                               firstName: referee.firstName,
                                                               email: referee.email,
                                                               role: referee.role,
                                                               competition: referee.competition
                                                           });
                                                       }}>
                                            <Button>Modify</Button>
                                        </DialogTrigger>
                                        <Button onClick={() => {
                                            router.push(`/dashboard/history?ir=${referee.id}`);
                                        }}>History</Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
            <DialogContent>
                <DialogTitle>
                    {dialog == "create" ? "Add new referee" : `Modifying ${currentReferee.lastName.toUpperCase()} ${currentReferee.firstName}`}
                </DialogTitle>
                <DialogDescription>
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" value={currentReferee.lastName}
                           onChange={(event) => {
                               setCurrentReferee({
                                   ...currentReferee,
                                   lastName: event.target.value
                               });
                           }}/>

                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" value={currentReferee.firstName}
                           onChange={(event) => {
                               setCurrentReferee({
                                   ...currentReferee,
                                   firstName: event.target.value
                               });
                           }}/>

                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={currentReferee.email} onChange={(event) => {
                        setCurrentReferee({
                            ...currentReferee,
                            email: event.target.value
                        });
                    }}/>

                    <Label htmlFor="role">Role</Label>
                    <Select defaultValue={currentReferee.role} onValueChange={(value) => {
                        const role = RoleEnum.safeParse(value);
                        if (!role.success) {
                            toast({
                                variant: "destructive",
                                title: "Invalid role",
                                description: "Please select a valid role."
                            });
                            return;
                        }

                        setCurrentReferee({
                            ...currentReferee,
                            role: role.data
                        });
                    }}>
                        <SelectTrigger>
                            <SelectValue id={"role"} placeholder="Role"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="coach">Coach</SelectItem>
                            <SelectItem value="delegate">Delegate</SelectItem>
                            <SelectItem value="referee">Referee</SelectItem>
                        </SelectContent>
                    </Select>

                    <Label htmlFor="competition">Competition</Label>
                    <Select defaultValue={currentReferee.competition} onValueChange={(value) => {
                        const competition = CompetitionEnum.safeParse(value);
                        if (!competition.success) {
                            toast({
                                variant: "destructive",
                                title: "Invalid competition",
                                description: "Please select a valid competition."
                            });
                            return;
                        }

                        setCurrentReferee({
                            ...currentReferee,
                            competition: competition.data
                        });
                    }}>
                        <SelectTrigger>
                            <SelectValue id={"competition"} placeholder="Competition"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="elite">Elite</SelectItem>
                            <SelectItem value="national">National</SelectItem>
                            <SelectItem value="league">League</SelectItem>
                            <SelectItem value="regional">Regional</SelectItem>
                        </SelectContent>
                    </Select>

                    <DialogClose asChild>
                        <Button className="mt-3 mr-3" onClick={() => {
                            if (!isRefereeValid(currentReferee)) return;

                            if (dialog == "create") {
                                createReferee(currentReferee.lastName, currentReferee.firstName, currentReferee.email, currentReferee.role, currentReferee.competition)
                            } else {
                                modifyReferee(currentReferee.id, {
                                    email: currentReferee.email,
                                    lastName: currentReferee.lastName,
                                    firstName: currentReferee.firstName,
                                    role: currentReferee.role,
                                    competition: currentReferee.competition
                                });
                            }

                            router.refresh();
                        }}>{dialog == "create" ? "Add" : "Modify"}
                        </Button>
                    </DialogClose>
                    {dialog == "modify" &&
                        <DialogClose asChild>
                            <Button className="mt-3" onClick={() => {
                                // TODO look for a way to avoid refreshing the page
                                deleteReferee(currentReferee.id).then(() => {
                                    toast({
                                        variant: "default",
                                        title: "Deletion",
                                        description: "Referee deleted successfully"
                                    });
                                });
                                router.refresh();
                            }}>Delete
                            </Button>
                        </DialogClose>}
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

const isRefereeValid = (referee: RefereeCreate) => {
    const result = RefereeSchema.safeParse(referee);
    return result.success;
}

export default RefereeComponent;