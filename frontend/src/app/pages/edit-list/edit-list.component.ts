import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit {
  selectedListId: any;
  listId: string = '';

  constructor(private route: ActivatedRoute, private taskService: TaskService, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.listId = params.listId;
    })
  }

  updateList(title: string) {
    this.taskService.updateList(this.listId, title).subscribe(() => {
      this.router.navigate(['/lists',this.listId]);
    })
  }

}
